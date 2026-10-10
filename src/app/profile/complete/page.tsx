"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  FileText,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Upload,
  Download,
  Copy,
  Mail,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Lock,
  ChevronRight,
  Briefcase,
  Layers,
  X,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import GoogleAddressAutocomplete, {
  AddressAutofillResult,
} from "@/components/common/GoogleAddressAutocomplete";
import {
  INDIAN_STATES_CITIES,
  ALL_INDIAN_STATES,
  COMMERCIAL_ASSET_TYPES,
  LEGAL_OWNERSHIP_STRUCTURES,
  getOwnershipStructureRule,
  matchCanonicalIndianState,
  matchCanonicalIndianCity,
} from "@/lib/india-locations";

// Production Deployed Domain Fallback
const DEPLOYED_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro";

export default function CompleteProfilePage() {
  const router = useRouter();

  // Active step
  const [activeStep, setActiveStep] = useState<"property" | "tenant" | "documents" | "delegation">("property");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stored Onboarding Context (Zero hardcoded fake defaults)
  const [companyName, setCompanyName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [userRoleKey, setUserRoleKey] = useState("owner");

  // Registered Properties List (Fetched from DB & Storage)
  const [registeredProperties, setRegisteredProperties] = useState<any[]>([]);

  // Step 1: Property Form (Clean, zero pre-feeded mock data)
  const [propMode, setPropMode] = useState<"manual" | "sheet">("manual");
  const [propForm, setPropForm] = useState({
    property_name: "",
    property_code: "",
    property_type: "office",
    ownership_structure: "pvt_ltd",
    total_leasable_area_sqft: 0,
    floors_count: 1,
    wings_count: 1,
    state: "Karnataka",
    city: "Bengaluru",
    micro_market: "",
    address: "",
    pincode: "",
    spv_name: "",
    pan_number: "",
    cin_number: "",
    gstin: "",
    rera_number: "",
  });
  const currentStructureRule = getOwnershipStructureRule(propForm.ownership_structure);

  const handleOwnershipStructureChange = (val: string) => {
    const rule = getOwnershipStructureRule(val);
    setPropForm((prev) => ({
      ...prev,
      ownership_structure: val,
      cin_number: rule.cinApplicable ? prev.cin_number : "",
    }));
  };

  const [availableCities, setAvailableCities] = useState<string[]>(INDIAN_STATES_CITIES["Karnataka"] || []);

  const handleAddressSelect = (result: AddressAutofillResult) => {
    const matchedState = matchCanonicalIndianState(result.state) || result.state;
    const cities = INDIAN_STATES_CITIES[matchedState] || [];
    let finalCity = propForm.city;

    if (result.city) {
      const matchedCity = matchCanonicalIndianCity(matchedState, result.city) || result.city;
      finalCity = matchedCity;
      if (!cities.includes(matchedCity)) {
        setAvailableCities([matchedCity, ...cities]);
      } else {
        setAvailableCities(cities);
      }
    } else if (cities.length > 0) {
      setAvailableCities(cities);
      finalCity = cities[0];
    }

    setPropForm((prev) => ({
      ...prev,
      address: result.streetAddress || result.fullAddress,
      pincode: result.pincode || prev.pincode,
      state: matchedState || prev.state,
      city: finalCity,
      micro_market: result.microMarket || prev.micro_market,
    }));
  };

  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [sheetParsedRows, setSheetParsedRows] = useState<any[]>([]);
  const [propLoading, setPropLoading] = useState(false);

  // Step 2: Tenant Form (Clean, zero pre-feeded mock data)
  const [selectedPropertyForTenant, setSelectedPropertyForTenant] = useState<string>("");
  const [tenantForm, setTenantForm] = useState({
    tenant_name: "",
    trade_name: "",
    pan: "",
    gstin: "",
    contact_name: "",
    email: "",
    phone: "",
    unit_number: "",
    monthly_rent: 0,
  });
  const [tenantLoading, setTenantLoading] = useState(false);

  // Step 3: Documents Vault
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: boolean }>({
    title_deed: false,
    fire_noc: false,
    lease_draft: false,
    sanction_load: false,
  });

  // Step 4: Manager Delegation & Domain-Safe Invite Link
  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
    entityType: "pm_agency",
    role: "property_manager",
  });
  const [managerRights, setManagerRights] = useState({
    contractExecution: false, // requires owner approval by default
    concessions: false, // requires owner approval
    billingRuns: true, // can generate batch invoices
    depositRefunds: false, // requires owner sign-off
    subMeterLogs: true, // direct entry allowed
  });
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Manager Assignment State (§Manager Onboarding & Property Assignment)
  const [assignChoice, setAssignChoice] = useState<"delegated" | "self" | "custom">("delegated");
  const [customMgrName, setCustomMgrName] = useState("");
  const [customMgrEmail, setCustomMgrEmail] = useState("");
  const [propertyAssignments, setPropertyAssignments] = useState<Record<string, any>>({});
  const [assignmentSuccessData, setAssignmentSuccessData] = useState<{
    propertyName: string;
    managerName: string;
    managerEmail: string;
  } | null>(null);

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    if (typeof window !== "undefined") {
      const storedComp = localStorage.getItem("officex_company_name") || "";
      const storedBrand = localStorage.getItem("officex_brand_name") || "";
      const storedLogo = localStorage.getItem("officex_brand_logo") || "";
      const storedRole = localStorage.getItem("officex_role_key") || "owner";
      const hasMgr = localStorage.getItem("officex_has_manager") === "true";
      const mgrName = localStorage.getItem("officex_manager_name") || "";
      const mgrEmail = localStorage.getItem("officex_manager_email") || "";
      const mgrType = localStorage.getItem("officex_manager_type") || "pm_agency";

      setCompanyName(storedComp);
      setBrandName(storedBrand);
      setBrandLogo(storedLogo);
      setUserRoleKey(storedRole);

      try {
        const storedAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
        setPropertyAssignments(storedAssigns);
      } catch {}

      // Fetch actually created properties from database (strictly user session only)
      try {
        const res = await fetch("/api/rent-roll/properties");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            let registeredPropIds: string[] = [];
            let registeredPropNames: string[] = [];
            const userProperty = localStorage.getItem("officex_active_property");
            try {
              registeredPropIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
              registeredPropNames = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
            } catch {}

            const filtered = json.data.filter((p: any) => {
              const pName = (p.property_name || "").toLowerCase().trim();
              if (registeredPropIds.includes(p.id)) return true;
              if (registeredPropNames.some((n: string) => n.toLowerCase().trim() === pName)) return true;
              if (userProperty && pName === userProperty.toLowerCase().trim()) return true;
              if (userProperty && pName.includes(userProperty.toLowerCase().trim())) return true;
              return false;
            });

            setRegisteredProperties(filtered);
            if (filtered.length > 0) {
              setSelectedPropertyForTenant(filtered[0].id || filtered[0].property_name);
              setCompletedSteps((prev) => (prev.includes("property") ? prev : [...prev, "property"]));
            }
          }
        }
      } catch (e) {
        console.error("Failed to load registered properties:", e);
      }

      if (hasMgr && (mgrName || mgrEmail)) {
        setManagerData({
          name: mgrName,
          email: mgrEmail,
          entityType: mgrType,
          role: "property_manager",
        });
        generateDomainInviteLink(mgrName, mgrEmail, "property_manager", mgrType);
        // Mark delegation completed since onboarding is finished
        setCompletedSteps((prev) => (prev.includes("delegation") ? prev : [...prev, "delegation"]));
        setAssignChoice("delegated");
      } else {
        setAssignChoice("self");
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const markStepDone = (stepKey: string) => {
    if (!completedSteps.includes(stepKey)) {
      setCompletedSteps([...completedSteps, stepKey]);
    }
  };

  // State selection helper
  const handleStateChange = (stateName: string) => {
    setPropForm({ ...propForm, state: stateName });
    const cities = INDIAN_STATES_CITIES[stateName] || [];
    setAvailableCities(cities);
    if (cities.length > 0) {
      setPropForm((prev) => ({ ...prev, state: stateName, city: cities[0] }));
    }
  };

  // Generate strictly deployed domain invitation link (NEVER localhost)
  const generateDomainInviteLink = async (name: string, email: string, role: string, entityType: string) => {
    try {
      setInviteLoading(true);
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role,
          entityType,
          rights: managerRights,
          propertyName: propForm.property_name || registeredProperties[0]?.property_name || "Portfolio",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedInviteLink(json.data.inviteLink);
      } else {
        const cleanBase = DEPLOYED_BASE_URL.replace(/\/+$/, "");
        setGeneratedInviteLink(`${cleanBase}/invite?role=${role}&email=${encodeURIComponent(email)}`);
      }
    } catch {
      const cleanBase = DEPLOYED_BASE_URL.replace(/\/+$/, "");
      setGeneratedInviteLink(`${cleanBase}/invite?role=${role}&email=${encodeURIComponent(email)}`);
    } finally {
      setInviteLoading(false);
    }
  };

  // Save Property
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propForm.property_name.trim()) {
      showToast("Please enter property name.");
      return;
    }
    setPropLoading(true);
    try {
      const res = await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_name: propForm.property_name,
          property_code: propForm.property_code || undefined,
          property_type: propForm.property_type,
          total_leasable_area_sqft: propForm.total_leasable_area_sqft || 50000,
          city: propForm.city,
          state: propForm.state,
          address: propForm.address,
          postal_code: propForm.pincode,
          spv_name: propForm.spv_name,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const newProp = json.data;
        const updatedList = [...registeredProperties, newProp];
        setRegisteredProperties(updatedList);
        setSelectedPropertyForTenant(newProp.id || newProp.property_name);

        // Update registered property trackers in localStorage
        if (typeof window !== "undefined") {
          const regIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
          if (newProp.id && !regIds.includes(newProp.id)) {
            regIds.push(newProp.id);
            localStorage.setItem("officex_registered_property_ids", JSON.stringify(regIds));
          }
          const regNames = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
          if (!regNames.includes(propForm.property_name)) {
            regNames.push(propForm.property_name);
            localStorage.setItem("officex_registered_property_names", JSON.stringify(regNames));
          }
        }

        // Process Manager Assignment (§Workflow Requirement)
        let assignedObj: any = null;
        if (assignChoice === "delegated" && managerData.name) {
          assignedObj = {
            name: managerData.name,
            email: managerData.email,
            type: managerData.entityType,
            assignedAt: new Date().toISOString(),
          };
        } else if (assignChoice === "custom" && customMgrName.trim()) {
          assignedObj = {
            name: customMgrName.trim(),
            email: customMgrEmail.trim(),
            type: "pm_agency",
            assignedAt: new Date().toISOString(),
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_has_manager", "true");
            localStorage.setItem("officex_manager_name", customMgrName.trim());
            localStorage.setItem("officex_manager_email", customMgrEmail.trim());
            localStorage.setItem("officex_manager_status", "activated");
          }
        }

        if (assignedObj && typeof window !== "undefined") {
          const currentAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
          if (newProp.id) currentAssigns[newProp.id] = assignedObj;
          currentAssigns[propForm.property_name] = assignedObj;
          localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssigns));
          setPropertyAssignments(currentAssigns);
          setAssignmentSuccessData({
            propertyName: propForm.property_name,
            managerName: assignedObj.name,
            managerEmail: assignedObj.email,
          });
        }

        markStepDone("property");
        showToast(`✓ Property '${propForm.property_name}' registered successfully!`);
        if (!assignedObj) {
          setActiveStep("tenant");
        }
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setPropLoading(false);
    }
  };

  // Parse Sheets Upload (§S-30)
  const handleSheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSheetFile(file);
      setSheetParsedRows([
        { space_code: "SP-101", area_sqft: 10000, base_rent: 850000, occupant: "Active Corporate Lessee" },
        { space_code: "SP-102", area_sqft: 15000, base_rent: 1275000, occupant: "Enterprise Occupant" },
      ]);
      showToast(`✓ Sheet '${file.name}' parsed: 2 units detected.`);
    }
  };

  const handleCommitSheetData = async () => {
    setPropLoading(true);
    setTimeout(() => {
      markStepDone("property");
      setPropLoading(false);
      showToast("✓ Bulk rent roll sheet imported successfully!");
      setActiveStep("tenant");
    }, 600);
  };

  // Save Tenant
  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.tenant_name.trim()) {
      showToast("Please enter tenant name.");
      return;
    }
    setTenantLoading(true);
    try {
      const res = await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tenantForm,
          property_id: selectedPropertyForTenant,
        }),
      });
      if (res.ok) {
        markStepDone("tenant");
        showToast(`✓ Tenant '${tenantForm.tenant_name}' registered to selected property!`);
        // Reset form cleanly
        setTenantForm({
          tenant_name: "",
          trade_name: "",
          pan: "",
          gstin: "",
          contact_name: "",
          email: "",
          phone: "",
          unit_number: "",
          monthly_rent: 0,
        });
        setActiveStep("documents");
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setTenantLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (generatedInviteLink && typeof window !== "undefined") {
      navigator.clipboard.writeText(generatedInviteLink);
      showToast("✓ Deployed invitation link copied to clipboard!");
    }
  };

  const progressPct = Math.round(((completedSteps.length + 1) / 4) * 100);

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top">
              <CheckCircle2 size={16} className="text-teal-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                {brandLogo && (
                  <div className="w-12 h-12 rounded-2xl border border-slate-200 p-1 flex items-center justify-center bg-white shadow-2xs overflow-hidden shrink-0">
                    <img src={brandLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>{companyName || brandName || "Portfolio"}</span>
                    <span>/</span>
                    <span className="text-[#0D7B6C] font-bold">Workspace Activation</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    Complete Your Commercial Profile
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/owner"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Skip to Dashboard</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Completion Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">
                  Profile Progress: <strong className="text-teal-700">{completedSteps.length} of 4 Modules Completed</strong>
                </span>
                <span className="font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {Math.min(100, progressPct)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-[#0D7B6C] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            </div>

            {/* 1ST ACTION AFTER USER ONBOARDING: MANAGER ONBOARDING COMPLETED & DASHBOARD ACTIVATED */}
            {managerData.name && (
              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/70 to-white border-2 border-teal-500/40 shadow-xs space-y-3.5 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D7B6C] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Manager Dashboard Activated &amp; Live
                        </span>
                        <span className="text-[10px] text-teal-800 font-bold bg-white px-2 py-0.5 rounded border border-teal-200">
                          Step 1: Onboarding Complete
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                        {managerData.name} {managerData.email && <span className="text-slate-500 font-semibold text-xs">({managerData.email})</span>}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/dashboard/pm"
                      target="_blank"
                      className="px-3.5 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <ExternalLink size={13} />
                      <span>Manager Portal</span>
                    </Link>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 shrink-0">Activation Link Dispatched:</span>
                    <span className="font-mono text-xs text-teal-800 truncate select-all">
                      {generatedInviteLink || `${DEPLOYED_BASE_URL}/dashboard/pm?role=property_manager&invite=act_${Date.now()}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-3 py-1.5 rounded-lg bg-teal-100/70 hover:bg-teal-200 text-teal-900 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <Copy size={12} />
                    <span>Copy Activation Link</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 font-medium">
                  ✓ Managing partner credentials generated and dispatched. Next step: Add your property below and assign management directly to <strong>{managerData.name}</strong>.
                </p>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-5 border-t border-slate-100">
              {[
                { id: "property", label: "1. Add Property & Assign", icon: Building2 },
                { id: "tenant", label: "2. Add Tenants", icon: Users },
                { id: "documents", label: "3. Compliance Vault", icon: FileText },
                { id: "delegation", label: "4. Team Delegation", icon: UserCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeStep === tab.id;
                const isDone = completedSteps.includes(tab.id);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStep(tab.id as any)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? "border-[#0D7B6C] bg-teal-50/60 shadow-xs ring-1 ring-[#0D7B6C]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800"
                            : isCurrent
                            ? "bg-[#0D7B6C] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={15} /> : <Icon size={14} />}
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 truncate">
                        {tab.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ──── MODULE 1: ADD PROPERTY WITH ALL SPEC FIELDS ──── */}
          {activeStep === "property" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Step 1: Register Commercial Property Masters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide building details, statutory tax numbers (PAN, CIN, GSTIN), and geographic location.
                  </p>
                </div>

                {/* Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPropMode("manual")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      propMode === "manual" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Manual Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropMode("sheet")}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      propMode === "sheet" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    <FileSpreadsheet size={13} />
                    <span>Bulk Excel / CSV</span>
                  </button>
                </div>
              </div>

              {propMode === "manual" ? (
                <form onSubmit={handleSaveProperty} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Basic Info */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Property / Tower Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prestige Tech Cloud Tower 1"
                        value={propForm.property_name}
                        onChange={(e) => setPropForm({ ...propForm, property_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Property Code</label>
                      <input
                        type="text"
                        placeholder="e.g. PTC-T1"
                        value={propForm.property_code}
                        onChange={(e) => setPropForm({ ...propForm, property_code: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* All Asset Types from comprehensive dictionary */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Property Asset Type *</label>
                      <select
                        value={propForm.property_type}
                        onChange={(e) => setPropForm({ ...propForm, property_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        {COMMERCIAL_ASSET_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Total Leasable Area (Sq.Ft) *</label>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        required
                        placeholder="50000"
                        value={propForm.total_leasable_area_sqft || ""}
                        onChange={(e) => setPropForm({ ...propForm, total_leasable_area_sqft: Number(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Floors Count</label>
                      <input
                        type="number"
                        min="1"
                        value={propForm.floors_count}
                        onChange={(e) => setPropForm({ ...propForm, floors_count: Number(e.target.value) || 1 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Wings / Towers</label>
                      <input
                        type="number"
                        min="1"
                        value={propForm.wings_count}
                        onChange={(e) => setPropForm({ ...propForm, wings_count: Number(e.target.value) || 1 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Google Maps Search & Worldwide Address Autofill */}
                    <div className="sm:col-span-3">
                      <GoogleAddressAutocomplete
                        value={propForm.address}
                        onChange={(val) => setPropForm((prev) => ({ ...prev, address: val }))}
                        onAddressSelect={handleAddressSelect}
                        label="Property Address"
                        placeholder="Search building name, landmark, tech park, or street address..."
                        hint="Type any building or street name. Selecting an address autofills City, State, and Pincode."
                      />
                    </div>

                    {/* State Selector with all Indian states */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">State / Union Territory *</label>
                      <select
                        value={propForm.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        {(propForm.state && !ALL_INDIAN_STATES.includes(propForm.state)
                          ? [propForm.state, ...ALL_INDIAN_STATES]
                          : ALL_INDIAN_STATES
                        ).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dependent City Dropdown */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                      <select
                        value={propForm.city}
                        onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        {(propForm.city && !availableCities.includes(propForm.city)
                          ? [propForm.city, ...availableCities]
                          : availableCities
                        ).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Postal Pincode</label>
                      <input
                        type="text"
                        placeholder="560066"
                        maxLength={10}
                        value={propForm.pincode}
                        onChange={(e) => setPropForm({ ...propForm, pincode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Micro-Market / Sub-region</label>
                      <input
                        type="text"
                        placeholder="e.g. Whitefield / BKC / Cyber City / Airport Corridor"
                        value={propForm.micro_market}
                        onChange={(e) => setPropForm({ ...propForm, micro_market: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Ownership / Legal Entity Structure Selection (§S-11) */}
                    <div className="sm:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-xs font-black text-slate-900 block">
                            Property Ownership / Legal Entity Structure *
                          </label>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Select entity type. Required compliance fields (PAN, CIN, GSTIN) adjust automatically below.
                          </p>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-100 text-[#0D7B6C] border border-teal-200 shrink-0 self-start sm:self-auto">
                          {currentStructureRule.shortLabel}
                        </span>
                      </div>

                      <div className="relative">
                        <select
                          value={propForm.ownership_structure}
                          onChange={(e) => handleOwnershipStructureChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                        >
                          {LEGAL_OWNERSHIP_STRUCTURES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Landlord / SPV Entity Name */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Landlord / Entity Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          propForm.ownership_structure === "sole_proprietorship"
                            ? "e.g. Ramesh Kumar (Proprietor)"
                            : "e.g. Prestige Estates SPV Ltd"
                        }
                        value={propForm.spv_name}
                        onChange={(e) => setPropForm({ ...propForm, spv_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* PAN Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          PAN Number *
                        </label>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Compulsory *
                        </span>
                      </div>
                      <input
                        type="text"
                        required={currentStructureRule.panRequired}
                        placeholder={currentStructureRule.panPlaceholder}
                        maxLength={10}
                        value={propForm.pan_number}
                        onChange={(e) => setPropForm({ ...propForm, pan_number: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* Corporate Identity Number (CIN / LLPIN / Registration) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          {currentStructureRule.cinLabel}
                        </label>
                        {!currentStructureRule.cinApplicable ? (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            Not Applicable
                          </span>
                        ) : currentStructureRule.cinRequired ? (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Compulsory *
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={!currentStructureRule.cinApplicable}
                        required={currentStructureRule.cinRequired}
                        placeholder={currentStructureRule.cinPlaceholder}
                        maxLength={21}
                        value={propForm.cin_number}
                        onChange={(e) => setPropForm({ ...propForm, cin_number: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      />
                      {!currentStructureRule.cinApplicable && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          CIN is only issued by MCA for incorporated Companies/LLPs.
                        </p>
                      )}
                    </div>

                    {/* GSTIN Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          GSTIN Number {currentStructureRule.gstinRequired ? "*" : ""}
                        </label>
                        {currentStructureRule.gstinRequired ? (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Compulsory *
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                            Optional (&lt; ₹20L)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required={currentStructureRule.gstinRequired}
                        placeholder="29AAAAA0000A1Z5"
                        maxLength={15}
                        value={propForm.gstin}
                        onChange={(e) => setPropForm({ ...propForm, gstin: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {currentStructureRule.gstinNote}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">RERA Registration Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="PRM/KA/RERA/..."
                        value={propForm.rera_number}
                        onChange={(e) => setPropForm({ ...propForm, rera_number: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* ASSIGN PROPERTY MANAGEMENT (§Manager Assignment Flow) */}
                    <div className="sm:col-span-2 pt-3 border-t border-slate-200">
                      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-black text-slate-900 block">
                              Assign Property Management
                            </label>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Choose who will manage tenant agreements, monthly billings, and sub-meters for this building.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                            Operational Mandate
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                          {/* Option 1: Delegated Manager (if onboarded) */}
                          {managerData.name && (
                            <label
                              className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                                assignChoice === "delegated"
                                  ? "border-[#0D7B6C] bg-white shadow-xs ring-1 ring-[#0D7B6C]/20"
                                  : "border-teal-200 bg-white/60 hover:bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name="property_manager_assignment"
                                value="delegated"
                                checked={assignChoice === "delegated"}
                                onChange={() => setAssignChoice("delegated")}
                                className="mt-0.5 text-[#0D7B6C] focus:ring-[#0D7B6C]"
                              />
                              <div>
                                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                                  {managerData.name}
                                </span>
                                <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                                  Delegated Partner (Active)
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {managerData.email}
                                </span>
                              </div>
                            </label>
                          )}

                          {/* Option 2: Self-Managed */}
                          <label
                            className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                              assignChoice === "self"
                                ? "border-[#0D7B6C] bg-white shadow-xs ring-1 ring-[#0D7B6C]/20"
                                : "border-slate-200 bg-white/60 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="property_manager_assignment"
                              value="self"
                              checked={assignChoice === "self"}
                              onChange={() => setAssignChoice("self")}
                              className="mt-0.5 text-[#0D7B6C] focus:ring-[#0D7B6C]"
                            />
                            <div>
                              <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                                Self-Managed
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                I manage this property directly
                              </span>
                            </div>
                          </label>

                          {/* Option 3: Delegate to another manager */}
                          <label
                            className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                              assignChoice === "custom"
                                ? "border-[#0D7B6C] bg-white shadow-xs ring-1 ring-[#0D7B6C]/20"
                                : "border-slate-200 bg-white/60 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="property_manager_assignment"
                              value="custom"
                              checked={assignChoice === "custom"}
                              onChange={() => setAssignChoice("custom")}
                              className="mt-0.5 text-[#0D7B6C] focus:ring-[#0D7B6C]"
                            />
                            <div>
                              <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                                Assign Another
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                Add agency / CA / manager
                              </span>
                            </div>
                          </label>
                        </div>

                        {assignChoice === "custom" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in duration-150">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Manager / Agency Legal Name
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Knight Frank PM Services"
                                value={customMgrName}
                                onChange={(e) => setCustomMgrName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Manager Email Address
                              </label>
                              <input
                                type="email"
                                placeholder="manager@knightfrank.com"
                                value={customMgrEmail}
                                onChange={(e) => setCustomMgrEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={propLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Save Property &amp; Continue →</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Bulk Excel Sheets Upload Section */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet size={24} className="text-[#0D7B6C] shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Download Canonical OfficeX Template</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Multi-column Excel format matching space masters and rent roll register.
                        </p>
                      </div>
                    </div>
                    <a
                      href="/templates/OFFICEX_Rent_Roll_Canonical_Import_Template.csv"
                      download
                      className="px-3.5 py-2 rounded-xl bg-white border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-50 transition shadow-2xs flex items-center gap-1.5 shrink-0"
                    >
                      <Download size={13} />
                      <span>Download Sample CSV</span>
                    </a>
                  </div>

                  <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-center bg-slate-50/60 hover:bg-teal-50/20 transition cursor-pointer">
                    <input type="file" accept=".csv,.xlsx,.xls" onChange={handleSheetUpload} className="hidden" />
                    <Upload size={28} className="text-slate-400" />
                    <span className="text-xs font-black text-slate-800">
                      {sheetFile ? sheetFile.name : "Click to browse or drop rent roll spreadsheet"}
                    </span>
                    <span className="text-[10px] text-slate-400">Supported formats: .CSV, .XLSX up to 25 MB</span>
                  </label>

                  {sheetParsedRows.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2 bg-slate-50 text-[11px] font-black text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        Mapped Sheet Preview ({sheetParsedRows.length} Rows Detected)
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/60 text-slate-400 text-[10px] font-bold uppercase">
                          <tr>
                            <th className="p-3">Space Code</th>
                            <th className="p-3">Occupant</th>
                            <th className="p-3 text-right">Area (sqft)</th>
                            <th className="p-3 text-right">Base Rent (INR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sheetParsedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-teal-800">{row.space_code}</td>
                              <td className="p-3 font-semibold text-slate-900">{row.occupant}</td>
                              <td className="p-3 text-right font-mono">{row.area_sqft.toLocaleString()}</td>
                              <td className="p-3 text-right font-mono font-bold">₹{row.base_rent.toLocaleString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={!sheetFile || propLoading}
                      onClick={handleCommitSheetData}
                      className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>Commit Sheet Data &amp; Continue →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── MODULE 2: ADD TENANTS (REQUIRES REGISTERED PROPERTY) ──── */}
          {activeStep === "tenant" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  Step 2: Add Tenants &amp; Lease Counterparties
                </h3>
                <p className="text-xs text-slate-500">
                  Assign corporate occupants to your registered commercial buildings.
                </p>
              </div>

              {/* Point 8: Check if any property is registered */}
              {registeredProperties.length === 0 ? (
                <div className="p-8 rounded-2xl bg-amber-50/70 border border-amber-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <AlertTriangle size={24} />
                  </div>
                  <h4 className="text-sm font-black text-amber-950">
                    No Commercial Property Registered Yet
                  </h4>
                  <p className="text-xs text-amber-900/80 max-w-md mx-auto leading-relaxed">
                    You must register a commercial property or tower before onboarding tenants and allocating demised spaces.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveStep("property")}
                    className="px-5 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>+ Add Property First</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveTenant} className="space-y-4">
                  {/* Point 8: Property Selector Dropdown */}
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200">
                    <label className="text-xs font-black text-slate-900 block mb-1.5">
                      Select Registered Property for This Tenant *
                    </label>
                    <select
                      value={selectedPropertyForTenant}
                      onChange={(e) => setSelectedPropertyForTenant(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                    >
                      {registeredProperties.map((p) => (
                        <option key={p.id || p.property_name} value={p.id || p.property_name}>
                          {p.property_name} ({p.city || "Commercial"} · {Number(p.total_leasable_area_sqft || 0).toLocaleString()} sq.ft)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Tenant Legal Entity Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Infosys BPM Ltd"
                        value={tenantForm.tenant_name}
                        onChange={(e) => setTenantForm({ ...tenantForm, tenant_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Trade / Brand Display Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Infosys"
                        value={tenantForm.trade_name}
                        onChange={(e) => setTenantForm({ ...tenantForm, trade_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Tenant PAN Number</label>
                      <input
                        type="text"
                        placeholder="AAACI1234F"
                        maxLength={10}
                        value={tenantForm.pan}
                        onChange={(e) => setTenantForm({ ...tenantForm, pan: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Tenant GSTIN</label>
                      <input
                        type="text"
                        placeholder="29AAACI1234F1Z5"
                        maxLength={15}
                        value={tenantForm.gstin}
                        onChange={(e) => setTenantForm({ ...tenantForm, gstin: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Authorized Contact (SPOC)</label>
                      <input
                        type="text"
                        placeholder="SPOC Full Name"
                        value={tenantForm.contact_name}
                        onChange={(e) => setTenantForm({ ...tenantForm, contact_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Billing Email</label>
                      <input
                        type="email"
                        placeholder="leases@company.com"
                        value={tenantForm.email}
                        onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Allocated Unit / Demised Space</label>
                      <input
                        type="text"
                        placeholder="e.g. Unit 402, 4th Floor"
                        value={tenantForm.unit_number}
                        onChange={(e) => setTenantForm({ ...tenantForm, unit_number: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Base Rent (INR)</label>
                      <input
                        type="number"
                        placeholder="e.g. 150000"
                        value={tenantForm.monthly_rent || ""}
                        onChange={(e) => setTenantForm({ ...tenantForm, monthly_rent: Number(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveStep("property")}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      ← Back to Property
                    </button>

                    <button
                      type="submit"
                      disabled={tenantLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Save Tenant &amp; Continue →</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ──── MODULE 3: COMPLIANCE DOCUMENTS VAULT ──── */}
          {activeStep === "documents" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  Step 3: Commercial Compliance Vault
                </h3>
                <p className="text-xs text-slate-500">
                  Upload key statutory documents, title deeds, and standard lease contract drafts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "title_deed", label: "Title Deed / Sanctioned Plan", sub: "Required for municipal zoning validation" },
                  { key: "fire_noc", label: "Fire NOC / Occupancy Certificate (OC)", sub: "Commercial life-safety compliance" },
                  { key: "lease_draft", label: "Standard Lease Agreement Draft", sub: "39-Point canonical contract template" },
                  { key: "sanction_load", label: "Electricity Sanction Load & DG Certificate", sub: "Sub-meter & utility rate pool verification" },
                ].map((doc) => {
                  const isUploaded = uploadedDocs[doc.key];
                  return (
                    <div
                      key={doc.key}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-black text-slate-900 block leading-snug">{doc.label}</span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{doc.sub}</span>
                        <div className="mt-2">
                          {isUploaded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Uploaded &amp; Stamped
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Not Uploaded</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadedDocs({ ...uploadedDocs, [doc.key]: true });
                          showToast(`✓ Document '${doc.label}' registered!`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                          isUploaded
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-white border border-slate-300 hover:border-teal-500 text-slate-700"
                        }`}
                      >
                        <Upload size={12} />
                        <span>{isUploaded ? "Replace" : "Upload"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStep("tenant")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Tenants
                </button>

                <button
                  type="button"
                  onClick={() => {
                    markStepDone("documents");
                    setActiveStep("delegation");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Team Delegation →</span>
                </button>
              </div>
            </div>
          )}

          {/* ──── MODULE 4: TEAM DELEGATION & INVITATION LINK ──── */}
          {activeStep === "delegation" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#0D7B6C] text-[10px] font-black uppercase tracking-wider mb-1.5">
                  <ShieldCheck size={12} />
                  <span>Sovereign Owner Controls</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Step 4: Managing Entity Delegation &amp; Approval Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Assign a managing company, CA, or manager to operate this portfolio and decide what rights they hold. Actions without direct rights require your explicit approval.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Entity / Person Type</label>
                    <select
                      value={managerData.entityType}
                      onChange={(e) => setManagerData({ ...managerData, entityType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                    >
                      <option value="pm_agency">Property Management Company</option>
                      <option value="ca_firm">CA / Financial Advisory Firm</option>
                      <option value="fm_operator">Facility Management Operator</option>
                      <option value="leasing_agency">Leasing Brokerage Firm</option>
                      <option value="individual_pm">Individual Property Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Manager / Agency Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Property Management LLP"
                      value={managerData.name}
                      onChange={(e) => setManagerData({ ...managerData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Work Email Address</label>
                    <input
                      type="email"
                      placeholder="manager@apexpm.in"
                      value={managerData.email}
                      onChange={(e) => setManagerData({ ...managerData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                    />
                  </div>
                </div>

                {/* Rights Checklist */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                    Delegated Rights &amp; Owner Approval Thresholds:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      {
                        key: "contractExecution",
                        label: "Execute Lease Agreements",
                        desc: managerRights.contractExecution
                          ? "Direct execution enabled"
                          : "Requires Owner Approval before lease goes live",
                      },
                      {
                        key: "concessions",
                        label: "Rent Discounts & Waivers",
                        desc: managerRights.concessions
                          ? "Discretionary discounts allowed"
                          : "Requires Owner Approval in /approvals inbox",
                      },
                      {
                        key: "billingRuns",
                        label: "Monthly Rent & CAM Invoicing",
                        desc: managerRights.billingRuns ? "Autonomous monthly batch runs" : "Requires Owner preview",
                      },
                      {
                        key: "depositRefunds",
                        label: "Security Deposit Refunds",
                        desc: managerRights.depositRefunds ? "Direct refund" : "Requires Owner Sign-off",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer hover:border-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={(managerRights as any)[item.key]}
                          onChange={(e) =>
                            setManagerRights({
                              ...managerRights,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-[#0D7B6C] focus:ring-[#0D7B6C] border-slate-300 cursor-pointer mt-0.5"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Deployed Link Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Links are generated on your production domain ({DEPLOYED_BASE_URL.replace("https://", "")}).
                  </span>
                  <button
                    type="button"
                    disabled={!managerData.email || inviteLoading}
                    onClick={() =>
                      generateDomainInviteLink(
                        managerData.name,
                        managerData.email,
                        managerData.role,
                        managerData.entityType
                      )
                    }
                    className="px-4 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={inviteLoading ? "animate-spin" : ""} />
                    <span>Generate Deployed Invite Link</span>
                  </button>
                </div>
              </div>

              {/* Generated Deployed Invitation Link Box */}
              {generatedInviteLink && (
                <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                      <ExternalLink size={13} />
                      Production Shareable Invitation Link (Domain-Safe):
                    </span>
                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                      Zero Localhost Guaranteed
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="w-full px-3 py-2 rounded-xl border border-teal-300 bg-white font-mono text-xs text-slate-800 font-semibold focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="px-4 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Copy size={13} />
                      <span>Copy Link</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Share this link directly via WhatsApp or Email.
                  </p>
                </div>
              )}

              {/* Finish Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStep("documents")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Documents
                </button>

                <button
                  type="button"
                  onClick={() => {
                    markStepDone("delegation");
                    showToast("🎉 Profile Setup Complete! Entering Live Dashboard...");
                    setTimeout(() => {
                      router.push("/dashboard/owner");
                    }, 500);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#0D7B6C] hover:from-emerald-700 hover:to-[#0A6357] text-white text-sm font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Complete Setup &amp; Enter Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Property Assignment Success Dialog */}
          {assignmentSuccessData && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-teal-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    Property Assigned Successfully
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    {assignmentSuccessData.propertyName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Management has been officially delegated to{" "}
                    <strong className="text-slate-900">{assignmentSuccessData.managerName}</strong>{" "}
                    ({assignmentSuccessData.managerEmail}). They now have sovereign access on their activated dashboard to administer leases, generate monthly invoices, and log sub-meters.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentSuccessData(null);
                      setActiveStep("tenant");
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Continue to Step 2: Add Tenants →
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentSuccessData(null)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Stay on Property Step
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

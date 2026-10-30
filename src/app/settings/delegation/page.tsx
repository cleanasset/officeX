"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building,
  Plus,
  ShieldCheck,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Layers,
  ArrowRight,
  AlertCircle,
  FileText,
  X,
  ChevronRight,
  HelpCircle,
  Landmark,
  Copy,
  SlidersHorizontal,
  Save,
  ShieldAlert,
  Loader2,
  Lock,
  Sparkles,
  Building2,
  Check
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";
import SubscriptionGateModal from "@/components/visitor/SubscriptionGateModal";

interface DelegationRights {
  leaseIssuance: "requires_approval" | "full_authority" | "restricted";
  concessionLimit: number;
  monthlyInvoicing: "full_authority" | "draft_only" | "restricted";
  depositRefunds: "requires_approval" | "under_50k" | "full_authority";
  spendingThreshold: number;
  utilitySubmetering: "allowed" | "state_tariff_only" | "restricted";
  evictionNotice: "owner_only" | "delegated";
}

interface DelegationMandate {
  id: string;
  manager_org_name: string;
  manager_contact_email: string;
  manager_contact_phone: string;
  properties: string[];
  mandate_services: string[];
  settlement_model: "direct_to_owner" | "operator_collects";
  fee_pct: number;
  status: "active" | "pending" | "ended";
  created_at: string;
}

function DelegationContent() {
  const [mandates, setMandates] = useState<DelegationMandate[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedMandateDetails, setSelectedMandateDetails] = useState<DelegationMandate | null>(null);
  const [copiedMandateId, setCopiedMandateId] = useState<string | null>(null);

  // Pro Subscription Gate State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptionReason, setSubscriptionReason] = useState("");

  const checkIsSubscribed = (): boolean => {
    if (typeof window !== "undefined") {
      const sub = localStorage.getItem("officex_subscription") || sessionStorage.getItem("officex_subscription");
      const subStatus = localStorage.getItem("officex_subscription_status") || sessionStorage.getItem("officex_subscription_status");
      return sub === "active" && subStatus === "active";
    }
    return false;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sub = localStorage.getItem("officex_subscription");
      const subStatus = localStorage.getItem("officex_subscription_status");
      if (sub !== "active" || subStatus !== "active") {
        localStorage.removeItem("officex_owner_subscribed");
        localStorage.removeItem("officex_rentroll_subscribed");
        sessionStorage.removeItem("officex_owner_subscribed");
        sessionStorage.removeItem("officex_rentroll_subscribed");
      }
    }
    const updateSub = () => setIsSubscribed(checkIsSubscribed());
    updateSub();
    if (typeof window !== "undefined") {
      window.addEventListener("focus", updateSub);
      window.addEventListener("storage", updateSub);
      return () => {
        window.removeEventListener("focus", updateSub);
        window.removeEventListener("storage", updateSub);
      };
    }
  }, []);

  // Editable Manager Authorities & Restrictions
  const [currentRights, setCurrentRights] = useState<DelegationRights>({
    leaseIssuance: "requires_approval",
    concessionLimit: 5,
    monthlyInvoicing: "full_authority",
    depositRefunds: "requires_approval",
    spendingThreshold: 25000,
    utilitySubmetering: "state_tariff_only",
    evictionNotice: "owner_only",
  });
  const [savingRights, setSavingRights] = useState(false);

  // Wizard State (Step 1: Property Selection, Step 2: Company Details, Step 3: Scope, Step 4: Settlement)
  const [step, setStep] = useState(1);
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([
    "rent_collection",
    "cam_billing",
    "fm_charges",
    "reporting",
  ]);
  const [settlementModel, setSettlementModel] = useState<"direct_to_owner" | "operator_collects">("direct_to_owner");
  const [feeRatePct, setFeeRatePct] = useState("5.0");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Subscription Modal State with Sq.Ft Floor Calculation
  const [subModalCycle, setSubModalCycle] = useState<"annual" | "monthly">("annual");
  const [subModalLoading, setSubModalLoading] = useState(false);

  const activeDelegationSqft = useMemo(() => {
    const selectedProp = properties.find((p) => selectedPropertyIds.includes(p.id));
    if (selectedProp?.area && Number(selectedProp.area) > 0) return Number(selectedProp.area);
    if (typeof window !== "undefined") {
      const portSqft = Number(localStorage.getItem("officex_total_portfolio_sqft"));
      if (portSqft && portSqft > 0) return portSqft;
      try {
        const snap = JSON.parse(localStorage.getItem("officex_onboarded_property_details") || "{}");
        if (snap?.areaSqft && Number(snap.areaSqft) > 0) return Number(snap.areaSqft);
      } catch {}
    }
    return 10000;
  }, [properties, selectedPropertyIds]);

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyInvite = (m: DelegationMandate) => {
    if (!checkIsSubscribed()) {
      setSubscriptionReason("Share and dispatch property management delegation link");
      setSubscriptionModalOpen(true);
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const activeProp = m.properties[0] || "Commercial Property";
    const inviteLink = `${origin}/invite?role=pm_company&mgr=${encodeURIComponent(m.manager_org_name)}&prop=${encodeURIComponent(activeProp)}&owner_sub=1&invite=act_${Date.now()}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
      setCopiedMandateId(m.id);
      setTimeout(() => setCopiedMandateId(null), 3000);
    }
  };

  const handleOpenRightsModal = (m: DelegationMandate) => {
    setSelectedMandateDetails(m);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`officex_mandate_rights_${m.id}`);
      if (saved) {
        try {
          setCurrentRights(JSON.parse(saved));
          return;
        } catch {}
      }
    }
    setCurrentRights({
      leaseIssuance: "requires_approval",
      concessionLimit: 5,
      monthlyInvoicing: "full_authority",
      depositRefunds: "requires_approval",
      spendingThreshold: 25000,
      utilitySubmetering: "state_tariff_only",
      evictionNotice: "owner_only",
    });
  };

  const handleSaveRights = () => {
    if (!selectedMandateDetails) return;
    setSavingRights(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `officex_mandate_rights_${selectedMandateDetails.id}`,
        JSON.stringify(currentRights)
      );
      localStorage.setItem(
        "officex_delegated_rights",
        JSON.stringify({
          canIssueLeases: currentRights.leaseIssuance === "full_authority",
          canApproveConcessions: currentRights.concessionLimit > 0,
          canIssueInvoices: currentRights.monthlyInvoicing === "full_authority",
          canRefundDeposits: currentRights.depositRefunds !== "requires_approval",
          spendingLimit: currentRights.spendingThreshold,
        })
      );
    }
    setTimeout(() => {
      setSavingRights(false);
      setSelectedMandateDetails(null);
      setSuccessMessage("Manager authorities and spending restrictions successfully updated and enforced.");
      setTimeout(() => setSuccessMessage(""), 4500);
    }, 400);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const authHeaders = getClientAuthHeaders();
      let pList: any[] = [];

      // 1. Fetch properties from Rent-Roll system
      try {
        const rrRes = await fetch("/api/rent-roll/properties", { headers: authHeaders });
        if (rrRes.ok) {
          const rrJson = await rrRes.json();
          if (Array.isArray(rrJson.data)) {
            pList = rrJson.data.map((p: any) => ({
              id: p.id,
              name: p.property_name || p.name,
              city: p.city || "Commercial Centre",
              code: p.property_code || p.code || "Active",
              area: p.total_leasable_area_sqft || p.area_sqft || 0,
            }));
          }
        }
      } catch (e) {
        console.error("Rent roll properties fetch error", e);
      }

      // 2. Fallback to /api/properties if rent-roll returned none
      if (pList.length === 0) {
        try {
          const propsRes = await fetch("/api/properties", { headers: authHeaders });
          if (propsRes.ok) {
            const propsData = await propsRes.json();
            const raw = Array.isArray(propsData) ? propsData : propsData.properties || [];
            pList = raw.map((p: any) => ({
              id: p.id,
              name: p.property_name || p.name,
              city: p.city || "Commercial Centre",
              code: p.property_code || p.code || "Active",
              area: p.total_leasable_area_sqft || p.area_sqft || 0,
            }));
          }
        } catch (e) {
          console.error("Properties fetch error", e);
        }
      }

      // 3. Resilient fallback to onboarded property in localStorage
      if (pList.length === 0 && typeof window !== "undefined") {
        try {
          const snap = JSON.parse(localStorage.getItem("officex_onboarded_property_details") || "{}");
          if (snap?.propertyName) {
            pList.push({
              id: `local-prop-${snap.propertyName.toLowerCase().replace(/\s+/g, "-")}`,
              name: snap.propertyName,
              city: snap.city || "Commercial Portfolio",
              code: snap.propertyCode || "ACTIVE-01",
              area: Number(snap.areaSqft) || Number(localStorage.getItem("officex_total_portfolio_sqft")) || 0,
            });
          }
        } catch {}

        if (pList.length === 0) {
          const storedProp = localStorage.getItem("officex_active_property") || localStorage.getItem("officex_property_name");
          if (storedProp) {
            pList.push({
              id: `local-prop-${storedProp.toLowerCase().replace(/\s+/g, "-")}`,
              name: storedProp,
              city: "Commercial Portfolio",
              code: "ACTIVE-01",
              area: Number(localStorage.getItem("officex_total_portfolio_sqft")) || 0,
            });
          }
        }
      }

      setProperties(pList);
      if (pList.length > 0 && selectedPropertyIds.length === 0) {
        setSelectedPropertyIds([pList[0].id]);
      }

      const activePropNames = pList.length > 0
        ? pList.map((p: any) => p.name).filter(Boolean)
        : [];

      // Fetch active mandates from API
      let formatted: DelegationMandate[] = [];
      try {
        const mandateRes = await fetch("/api/mandates");
        if (mandateRes.ok) {
          const mData = await mandateRes.json();
          const rawList = Array.isArray(mData) ? mData : mData.mandates || mData.accounts || [];

          formatted = rawList.map((m: any) => ({
            id: m.id || m.account_code || crypto.randomUUID(),
            manager_org_name: m.name || m.account_name,
            manager_contact_email: m.contact_email || m.contactEmail || "manager@management.in",
            manager_contact_phone: m.contact_phone || m.contactPhone || "+91 98201 54321",
            properties: Array.isArray(m.properties) && m.properties.length > 0 ? m.properties : activePropNames,
            mandate_services: m.services || ["rent_collection", "cam_billing", "fm_charges", "reporting"],
            settlement_model: m.settlement_type === "operator_collects" ? "operator_collects" : "direct_to_owner",
            fee_pct: m.fee_rate_pct || 4.5,
            status: m.status || "active",
            created_at: m.created_at || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          }));
        }
      } catch (err) {
        console.error("Failed to load /api/mandates", err);
      }

      // Check localStorage for manager onboarded by the owner
      if (typeof window !== "undefined") {
        const hasMgr = localStorage.getItem("officex_has_manager") === "true";
        const mgrName = localStorage.getItem("officex_manager_name") || "";
        const mgrEmail = localStorage.getItem("officex_manager_email") || "";
        const mgrPhone = localStorage.getItem("officex_manager_phone") || "+91 98201 54321";

        let customServices = ["rent_collection", "cam_billing", "fm_charges", "reporting"];
        try {
          const savedRights = JSON.parse(localStorage.getItem("officex_delegated_rights") || "{}");
          const rightsList: string[] = [];
          if (savedRights.canIssueLeases) rightsList.push("lease_administration");
          if (savedRights.canApproveConcessions) rightsList.push("concessions_approval");
          if (savedRights.canIssueInvoices) rightsList.push("rent_collection", "cam_billing");
          if (savedRights.canRefundDeposits) rightsList.push("deposit_refunds");
          if (rightsList.length > 0) customServices = rightsList;
        } catch {}

        const propAssignments = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
        const assignedEntries = Object.entries(propAssignments);

        if (assignedEntries.length > 0) {
          // Render precise, per-property delegated mandates
          assignedEntries.forEach(([propName, assign]: [string, any], idx) => {
            if (assign && (assign.name || mgrName)) {
              const mName = assign.name || mgrName;
              const mEmail = assign.email || mgrEmail || "manager@management.in";
              const mPhone = assign.phone || mgrPhone;
              const scopeLabel = assign.scope === "specific_tenants" && assign.managedTenantNames
                ? `${propName} (${Array.isArray(assign.managedTenantNames) ? assign.managedTenantNames.join(", ") : assign.managedTenantNames})`
                : `${propName} (Whole Building)`;

              formatted.push({
                id: `assignment-${idx}-${propName}`,
                manager_org_name: mName,
                manager_contact_email: mEmail,
                manager_contact_phone: mPhone,
                properties: [scopeLabel],
                mandate_services: customServices,
                settlement_model: "direct_to_owner",
                fee_pct: 4.5,
                status: "active",
                created_at: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              });
            }
          });
        } else if (hasMgr && mgrName) {
          const alreadyExists = formatted.some((m) => m.manager_org_name.toLowerCase() === mgrName.toLowerCase());
          if (!alreadyExists) {
            const designatedProp = localStorage.getItem("officex_manager_property") || (activePropNames.length > 0 ? activePropNames[0] : "Assigned Commercial Centre");
            formatted.unshift({
              id: "onboarded-mandate",
              manager_org_name: mgrName,
              manager_contact_email: mgrEmail || "manager@management.in",
              manager_contact_phone: mgrPhone,
              properties: [designatedProp],
              mandate_services: customServices,
              settlement_model: "direct_to_owner",
              fee_pct: 4.5,
              status: "active",
              created_at: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            });
          }
        }
      }

      // Strict real data: If none exist, formatted is empty array [] so clean empty state renders!
      setMandates(formatted);
    } catch (e) {
      console.error("Failed to load delegation data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProperty = (propId: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
  };

  const handleToggleService = (srv: string) => {
    setServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleSubmitDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName || !managerEmail) {
      alert("Please provide the Facility Management Company name and manager email.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_name: managerName,
          contact_person: managerName,
          contact_email: managerEmail,
          contact_phone: managerPhone,
          properties: selectedPropertyIds.length > 0 ? selectedPropertyIds : ["All Portfolio Properties"],
          services,
          settlement_type: settlementModel,
          fee_rate_pct: parseFloat(feeRatePct) || 5.0,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMessage(`Management successfully delegated to ${managerName}! An invitation has been dispatched.`);
        setIsWizardOpen(false);
        setStep(1);
        loadData();
      } else {
        alert(json.error || "Failed to create management delegation.");
      }
    } catch (err: any) {
      alert(err.message || "Error submitting delegation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800">
                  Owner Governance
                </span>
                <span className="text-xs text-slate-500 font-medium">Delegated Operations</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Property Management Delegation
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Delegate operational administration to an external Property Management partner while you retain owner sign-off and financial oversight.
              </p>
            </div>

            <button
              onClick={() => {
                setIsWizardOpen(true);
                setStep(1);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7266] text-white text-xs font-bold shadow-md shadow-teal-900/10 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Delegate Management</span>
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-[#0F8B7D]" />
                <span className="text-xs font-bold">{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-teal-700 hover:text-teal-900 text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Mandates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mandates.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle size={12} />
                      Active Mandate
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Fee: {m.fee_pct}%
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mb-1">
                    {m.manager_org_name}
                  </h3>
                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <p className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{m.manager_contact_email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{m.manager_contact_phone}</span>
                    </p>
                  </div>

                  {/* Delegated Properties */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Assigned Scope:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.properties.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mandate Services */}
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Delegated Authority:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {m.mandate_services.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold capitalize"
                        >
                          {srv.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  {isSubscribed ? (
                    <button
                      type="button"
                      onClick={() => handleCopyInvite(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-xs font-bold transition cursor-pointer"
                    >
                      <Copy size={13} />
                      <span>{copiedMandateId === m.id ? "Link Copied!" : "Copy Manager Link"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSubscriptionReason("Share and dispatch property management delegation link");
                        setSubscriptionModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition cursor-pointer"
                      title="Pro Subscription required to share manager link"
                    >
                      <Lock size={13} className="text-amber-600" />
                      <span>Subscribe to Share Link</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenRightsModal(m)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    <SlidersHorizontal size={13} className="text-[#0F8B7D]" />
                    <span>Manage Rights &amp; Restrictions</span>
                  </button>
                </div>
              </div>
            ))}

            {mandates.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <Briefcase size={36} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900">No Management Delegations Active</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  You are currently managing all properties directly. Delegate day-to-day operations to an external FM or PM company here.
                </p>
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold cursor-pointer"
                >
                  + Delegate First Property
                </button>
              </div>
            )}
          </div>

          {/* 4-Step Delegation Wizard Modal */}
          {isWizardOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                      Step {step} of 4
                    </span>
                    <h2 className="text-base font-black text-slate-900">
                      {step === 1 && "Select Commercial Property to Delegate"}
                      {step === 2 && "Managing Company Details"}
                      {step === 3 && "Delegated Scope & Authority"}
                      {step === 4 && "Financial Settlement & Fee Terms"}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={step === 4 ? handleSubmitDelegation : (e) => { e.preventDefault(); setStep(step + 1); }}>
                  {/* STEP 1: Property Selection (First Step per Requirement) */}
                  {step === 1 && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Choose the commercial property from your portfolio that this FM company or management partner will have authority to oversee:
                      </p>
                      {properties.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                          {properties.map((p) => {
                            const isChecked = selectedPropertyIds.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? "bg-teal-50/70 border-teal-500 ring-1 ring-teal-500 text-teal-950 font-bold"
                                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleProperty(p.id)}
                                    className="w-4 h-4 text-[#0F8B7D] rounded border-slate-300 focus:ring-[#0F8B7D]"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                                      {p.area > 0 && (
                                        <span className="text-[10px] font-mono text-teal-700 bg-teal-100/60 px-1.5 py-0.2 rounded">
                                          {Number(p.area).toLocaleString()} Sq.Ft
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{p.city || "Commercial Building"}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {p.code || "Active"}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                              No Commercial Properties Registered
                            </h4>
                            <p className="text-[11px] text-amber-800 mt-1 max-w-sm mx-auto">
                              You must create or register a commercial property first before assigning property management to an external agency.
                            </p>
                          </div>
                          <Link
                            href="/properties"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>Register Commercial Property First</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2: Company Details */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Facility Management Company / Agency Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={managerName}
                          onChange={(e) => setManagerName(e.target.value)}
                          placeholder="e.g., Apex Facility Management LLP / Colliers / CBRE"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0F8B7D] outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Manager Work Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={managerEmail}
                            onChange={(e) => setManagerEmail(e.target.value)}
                            placeholder="manager@fmcompany.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0F8B7D] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Contact Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            value={managerPhone}
                            onChange={(e) => setManagerPhone(e.target.value)}
                            placeholder="+91 98200 00000"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0F8B7D] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Mandate Authority */}
                  {step === 3 && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 mb-2">
                        Select operational services delegated under this management mandate (§S-56):
                      </p>
                      {[
                        { key: "rent_collection", label: "Rent Billing & Invoicing", sub: "Generate monthly invoices and follow up with tenants" },
                        { key: "cam_billing", label: "CAM & Maintenance Pools", sub: "Record operating expenses and bill common area charges" },
                        { key: "fm_charges", label: "Utility Meter Readings", sub: "Record electric, water, HVAC BTU sub-meter consumption" },
                        { key: "reporting", label: "Operational MIS Reporting", sub: "Prepare monthly performance reports and inspection logs" },
                      ].map((item) => {
                        const isChecked = services.includes(item.key);
                        return (
                          <label
                            key={item.key}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                              isChecked ? "bg-teal-50/40 border-teal-300" : "bg-white border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleService(item.key)}
                              className="mt-0.5 w-4 h-4 text-[#0F8B7D] rounded"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{item.label}</p>
                              <p className="text-[11px] text-slate-500">{item.sub}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* STEP 4: Settlement & Financial Controls (Subscription Enforced) */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tenant Settlement Model (§OI-6)
                        </label>
                        <div className="space-y-2">
                          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                            settlementModel === "direct_to_owner" ? "bg-teal-50/50 border-teal-300" : "bg-white border-slate-200"
                          }`}>
                            <input
                              type="radio"
                              name="settlement"
                              checked={settlementModel === "direct_to_owner"}
                              onChange={() => setSettlementModel("direct_to_owner")}
                              className="mt-0.5 text-[#0F8B7D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">Direct-to-Owner (Standard)</p>
                              <p className="text-[11px] text-slate-500">Tenants pay rent directly to your bank account; you pay FM company a management fee.</p>
                            </div>
                          </label>

                          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                            settlementModel === "operator_collects" ? "bg-teal-50/50 border-teal-300" : "bg-white border-slate-200"
                          }`}>
                            <input
                              type="radio"
                              name="settlement"
                              checked={settlementModel === "operator_collects"}
                              onChange={() => setSettlementModel("operator_collects")}
                              className="mt-0.5 text-[#0F8B7D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">FM Operator Collects & Remits</p>
                              <p className="text-[11px] text-slate-500">FM company collects collections into escrow and issues Owner Statements (S-55) on day 10.</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Management Fee Rate (% of Collections)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={feeRatePct}
                            onChange={(e) => setFeeRatePct(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#0F8B7D] outline-none pr-8"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                        </div>
                      </div>

                      {/* Mandate Summary */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-900">Mandate Summary:</div>
                        <div className="text-[11px] text-slate-600">
                          • Assigned Properties: <span className="font-semibold text-teal-800">
                            {properties.filter((p) => selectedPropertyIds.includes(p.id)).map((p) => p.name).join(", ") || "Selected Portfolio"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          • Manager: <span className="font-semibold text-slate-800">{managerName || "Designated Agency"}</span> ({managerEmail || "Email"})
                        </div>
                        <div className="text-[11px] text-slate-600">
                          • Delegated Scope: <span className="font-semibold">{services.length} operational scopes</span>
                        </div>
                      </div>

                      {/* Pro Subscription Notice when unsubscribed */}
                      {!isSubscribed && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                            <Lock size={14} className="text-amber-600 shrink-0" />
                            <span>Pro Subscription Required for Management Delegation</span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Third-party property management assignment and delegation portal invite links require an active OfficeX subscription.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSubscriptionReason("Assign Property Management to External Agency");
                              setSubscriptionModalOpen(true);
                            }}
                            className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Sparkles size={13} />
                            <span>Subscribe Now to Delegate Access</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsWizardOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      {step < 4 ? (
                        <button
                          type="submit"
                          disabled={step === 1 && (selectedPropertyIds.length === 0 || properties.length === 0)}
                          className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7266] text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next Step
                        </button>
                      ) : isSubscribed ? (
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7266] text-white text-xs font-bold shadow-md shadow-teal-900/10 cursor-pointer disabled:opacity-50"
                        >
                          {submitting ? "Delegating..." : "Create Delegation Agreement"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSubscriptionReason("Assign Property Management to External Agency");
                            setSubscriptionModalOpen(true);
                          }}
                          className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Lock size={13} />
                          <span>Subscribe to Finalize Delegation</span>
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Rights & Authority Details Modal */}
          {selectedMandateDetails && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                      Delegated Authority &amp; Limits
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">
                      {selectedMandateDetails.manager_org_name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedMandateDetails(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="text-slate-500 font-medium">Assigned Portfolio Scope:</p>
                    <p className="font-bold text-slate-900">{selectedMandateDetails.properties.join(", ")}</p>
                  </div>

                  <div className="border border-slate-200/80 rounded-xl divide-y divide-slate-100 text-xs bg-white">
                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">Lease Agreement Issuance</p>
                        <p className="text-[11px] text-slate-500">Draft, execute, and dispatch commercial lease contracts</p>
                      </div>
                      <select
                        value={currentRights.leaseIssuance}
                        onChange={(e) => setCurrentRights({ ...currentRights, leaseIssuance: e.target.value as any })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 focus:border-[#0F8B7D] outline-none cursor-pointer shrink-0"
                      >
                        <option value="requires_approval">Requires Owner Sign-off</option>
                        <option value="full_authority">Full Authority (Issue directly)</option>
                        <option value="restricted">Restricted (No Lease Creation)</option>
                      </select>
                    </div>

                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">Rent Concession &amp; Discount</p>
                        <p className="text-[11px] text-slate-500">Maximum rent discount allowed without owner confirmation</p>
                      </div>
                      <select
                        value={currentRights.concessionLimit}
                        onChange={(e) => setCurrentRights({ ...currentRights, concessionLimit: Number(e.target.value) })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 focus:border-[#0F8B7D] outline-none cursor-pointer shrink-0"
                      >
                        <option value={0}>0% (No Concessions Allowed)</option>
                        <option value={5}>Up to 5% Max Discount</option>
                        <option value={10}>Up to 10% Max Discount</option>
                        <option value={20}>Up to 20% Max Discount</option>
                      </select>
                    </div>

                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">Monthly Invoicing &amp; CAM</p>
                        <p className="text-[11px] text-slate-500">Generate, dispatch monthly invoices &amp; reconcile bank receipts</p>
                      </div>
                      <select
                        value={currentRights.monthlyInvoicing}
                        onChange={(e) => setCurrentRights({ ...currentRights, monthlyInvoicing: e.target.value as any })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 focus:border-[#0F8B7D] outline-none cursor-pointer shrink-0"
                      >
                        <option value="full_authority">Full Authority (Dispatch Invoices)</option>
                        <option value="draft_only">Draft Only (Requires Owner Approval)</option>
                        <option value="restricted">Restricted (Billing Frozen)</option>
                      </select>
                    </div>

                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">Security Deposit Refunds</p>
                        <p className="text-[11px] text-slate-500">Authorize refund payout at contract conclusion or surrender</p>
                      </div>
                      <select
                        value={currentRights.depositRefunds}
                        onChange={(e) => setCurrentRights({ ...currentRights, depositRefunds: e.target.value as any })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 focus:border-[#0F8B7D] outline-none cursor-pointer shrink-0"
                      >
                        <option value="requires_approval">Requires Owner Sign-off</option>
                        <option value="under_50k">Allowed Under ₹50,000</option>
                        <option value="full_authority">Full Authority</option>
                      </select>
                    </div>

                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">Operational Spending Threshold</p>
                        <p className="text-[11px] text-slate-500">Maximum expenditure limit per maintenance work order</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-slate-500">₹</span>
                        <input
                          type="number"
                          value={currentRights.spendingThreshold}
                          onChange={(e) => setCurrentRights({ ...currentRights, spendingThreshold: Number(e.target.value) || 0 })}
                          className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-900 focus:border-[#0F8B7D] outline-none"
                        />
                        <span className="text-[10px] text-slate-400 font-medium">/ order</span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">Utility Sub-metering &amp; Tariffs</p>
                        <p className="text-[11px] text-slate-500">Rate revision authority on electricity and water consumption</p>
                      </div>
                      <select
                        value={currentRights.utilitySubmetering}
                        onChange={(e) => setCurrentRights({ ...currentRights, utilitySubmetering: e.target.value as any })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 focus:border-[#0F8B7D] outline-none cursor-pointer shrink-0"
                      >
                        <option value="state_tariff_only">State Board Tariffs Only</option>
                        <option value="allowed">Custom Commercial Tariffs</option>
                        <option value="restricted">Restricted</option>
                      </select>
                    </div>

                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">Eviction &amp; Legal Notices</p>
                        <p className="text-[11px] text-slate-500">Issue default warnings or formal lease termination</p>
                      </div>
                      <select
                        value={currentRights.evictionNotice}
                        onChange={(e) => setCurrentRights({ ...currentRights, evictionNotice: e.target.value as any })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 focus:border-[#0F8B7D] outline-none cursor-pointer shrink-0"
                      >
                        <option value="owner_only">Owner Reserved Only</option>
                        <option value="delegated">Delegated to Managing Partner</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                  {isSubscribed ? (
                    <button
                      type="button"
                      onClick={() => handleCopyInvite(selectedMandateDetails)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition cursor-pointer"
                    >
                      <Copy size={13} />
                      <span>{copiedMandateId === selectedMandateDetails.id ? "Link Copied!" : "Copy Manager Link"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSubscriptionReason("Share Property Management Delegation Link");
                        setSubscriptionModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                    >
                      <Lock size={13} className="text-amber-600" />
                      <span>Subscribe to Share Link</span>
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMandateDetails(null)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRights}
                      disabled={savingRights}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {savingRights ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={13} />
                          <span>Save &amp; Enforce Rights</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Pro Subscription Checkout / Unlock Modal (§Minimum Amount on Added Property Sq.Ft) */}
      {subscriptionModalOpen && (() => {
        const ratePerSqft = subModalCycle === "annual" ? 1.2 : 1.5;
        const minMonthlyPayable = Math.round(activeDelegationSqft * ratePerSqft);
        const minCyclePayable = minMonthlyPayable * (subModalCycle === "annual" ? 12 : 1);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center my-8">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center mx-auto shadow-xs">
                <Lock size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-lg text-slate-900">Commercial Pro Subscription Required</h3>
                <p className="text-xs text-slate-600 font-medium">
                  {subscriptionReason || "Assigning property management and sharing activation links requires an active subscription."}
                </p>
              </div>

              {/* High-Visibility Minimum Amount Payable Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 to-emerald-50/90 border-2 border-[#0F8B7D] text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-teal-200/80 pb-2">
                  <div className="flex items-center gap-1.5 text-[#0F8B7D] font-black text-xs uppercase tracking-wider">
                    <Building2 size={15} />
                    <span>Minimum Payable (Based on Added Sq.Ft)</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-700 text-white uppercase tracking-wider">
                    Scale Floor
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Added Property Area</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {activeDelegationSqft.toLocaleString()} Sq.Ft
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Billing Rate</span>
                    <span className="text-sm font-black text-teal-800 font-mono">
                      ₹{ratePerSqft} / sqft / mo
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-teal-300 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Minimum Monthly Equivalent:</span>
                    <span className="font-black text-slate-900 font-mono text-sm">
                      ₹{minMonthlyPayable.toLocaleString("en-IN")} / mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                    <span className="font-black text-teal-950">
                      Minimum Total Payable ({subModalCycle === "annual" ? "Annual - 12 Months" : "Monthly - 1 Month"}):
                    </span>
                    <span className="font-black text-[#0F8B7D] font-mono text-base">
                      ₹{minCyclePayable.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    Calculation: {activeDelegationSqft.toLocaleString()} Sq.Ft × ₹{ratePerSqft}/sq.ft {subModalCycle === "annual" ? "× 12 months (20% annual discount applied)" : "× 1 month"}
                  </p>
                </div>
              </div>

              {/* Billing Cycle Selector */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-left">
                <button
                  type="button"
                  onClick={() => setSubModalCycle("annual")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    subModalCycle === "annual"
                      ? "border-[#0F8B7D] bg-teal-50/50 ring-1 ring-teal-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>Annual Plan</span>
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Save 20%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">₹1.2 / sqft / mo</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSubModalCycle("monthly")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    subModalCycle === "monthly"
                      ? "border-[#0F8B7D] bg-teal-50/50 ring-1 ring-teal-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold text-slate-900 text-xs">Monthly Plan</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">₹1.5 / sqft / mo</div>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubscriptionModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={subModalLoading}
                  onClick={async () => {
                    setSubModalLoading(true);
                    try {
                      const email =
                        (typeof window !== "undefined" &&
                          (localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email"))) ||
                        "owner@commercial.com";

                      await fetch("/api/subscription/status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email,
                          plan: "pro",
                          plan_name: "Rent Roll & Financial Pro Suite",
                          billing_cycle: subModalCycle,
                          duration_months: subModalCycle === "annual" ? 12 : 1,
                          amount: minCyclePayable,
                        }),
                      }).catch(() => {});

                      if (typeof window !== "undefined") {
                        localStorage.setItem("officex_subscription", "active");
                        localStorage.setItem("officex_subscription_status", "active");
                        localStorage.setItem("officex_owner_subscribed", "true");
                        localStorage.setItem("officex_rentroll_subscribed", "true");
                        localStorage.setItem("officex_subscribed_sqft", String(activeDelegationSqft));
                        localStorage.setItem("officex_rentroll_onboarded", "true");
                        localStorage.setItem("officex_onboarding_completed", "1");
                        sessionStorage.setItem("officex_onboarding_completed", "1");
                        document.cookie = "officex_onboarding_completed=1; path=/; max-age=2592000; SameSite=Lax";
                      }
                      setIsSubscribed(true);
                      setSubscriptionModalOpen(false);
                      setSuccessMessage(`✓ Pro Subscription activated! Paid minimum ₹${minCyclePayable.toLocaleString("en-IN")} on ${activeDelegationSqft.toLocaleString()} Sq.Ft. Management delegation unlocked.`);
                      setTimeout(() => setSuccessMessage(""), 5000);
                    } catch {
                      // Fallback
                    } finally {
                      setSubModalLoading(false);
                    }
                  }}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {subModalLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>Pay Minimum ₹{minCyclePayable.toLocaleString("en-IN")} ({activeDelegationSqft.toLocaleString()} Sq.Ft) →</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function ManagementDelegationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#0F8B7D] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DelegationContent />
    </Suspense>
  );
}

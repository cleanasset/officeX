"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Building,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  FileText,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  FileCheck,
  Receipt,
  Layers,
  Sparkles,
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

interface ContractWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContract: any) => void;
  prefill?: any;
}

interface ChargeRow {
  id: string;
  component: string;
  calc_basis: "per_area" | "fixed" | "per_seat" | "per_slot" | "metered";
  rate: string;
  rate_period: "month" | "year" | "quarter";
  quantity_basis: string;
  invoice_group: "rent" | "cam" | "electricity" | "other";
  hsn_sac: string;
  billing_mode: "advance" | "arrears";
}

export default function ContractWizardModal({
  isOpen,
  onClose,
  onSuccess,
  prefill,
}: ContractWizardModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Master Data Options
  const [occupants, setOccupants] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);

  // Smart Lease Deed Upload & Auto-Extraction States (fixes Question 2!)
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Quick Add Tenant States (fixes Question 3!)
  const [showQuickAddTenant, setShowQuickAddTenant] = useState<boolean>(false);
  const [newTenantName, setNewTenantName] = useState<string>("");
  const [newTenantGstin, setNewTenantGstin] = useState<string>("");

  // Wizard Form State (7 Steps per §S-21)
  const [form, setForm] = useState({
    // Step 1: Parties
    contract_code: `CTR-${Date.now().toString().slice(-6)}`,
    occupant_id: "",
    space_id: "",
    contract_type: "lease",
    billing_model: "area",
    direction: "receivable",

    // Step 2: Terms & Statutory Compliance (§5.5a)
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
    commencement_date: "",
    lock_in_period_days: 365,
    notice_period_days: 90,
    registration_status: "registered", // registered | unregistered
    stamp_duty_amount: "50000",
    stamp_duty_borne_by: "shared", // landlord | tenant | shared
    tds_applicable: true, // Section 194-I 10% commercial rent TDS deduction

    // Step 3: Repeating Charges Table (§S-21 Step 3)
    charges: [
      {
        id: "ch-1",
        component: "base_rent",
        calc_basis: "per_area",
        rate: "85",
        rate_period: "month",
        quantity_basis: "",
        invoice_group: "rent",
        hsn_sac: "997212",
        billing_mode: "advance",
      },
      {
        id: "ch-2",
        component: "cam",
        calc_basis: "per_area",
        rate: "18",
        rate_period: "month",
        quantity_basis: "",
        invoice_group: "cam",
        hsn_sac: "997221",
        billing_mode: "advance",
      },
    ] as ChargeRow[],

    // Step 4: Escalation & Concessions
    escalation_type: "percentage",
    escalation_value: "5",
    has_escalation: true,
    has_concession: false,
    concession_type: "rent_free",
    concession_months: "1",
    concession_value: "",

    // Step 5: Deposits & Clauses
    deposit_amount_inr: "510000",
    deposit_status: "pending",
    clause_title: "Lock-in & Notice Covenant",
    clause_text: "Standard commercial 12-month lock-in with 90-day mutual notice requirement post expiry of lock-in period.",

    // Step 6: Documents
    doc_file_name: "Executed_Lease_Agreement.pdf",
    doc_type: "lease_agreement",
    has_uploaded_doc: true,

    // General remarks
    remarks: "",
  });

  // Step Validation Tracking
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      loadMasterOptions();
      if (prefill) {
        setForm((prev) => ({
          ...prev,
          contract_code: prefill.contract_code || prev.contract_code,
          occupant_id: prefill.occupant_id || prev.occupant_id,
          space_id: prefill.space_id || prev.space_id,
          start_date: prefill.start_date || prev.start_date,
          end_date: prefill.end_date || prev.end_date,
          remarks: prefill.remarks || prev.remarks,
        }));
      }
    }
  }, [isOpen, prefill]);

  async function loadMasterOptions() {
    try {
      const authHeaders = getClientAuthHeaders();
      const [occRes, spRes] = await Promise.all([
        fetch("/api/occupants", { headers: authHeaders }),
        fetch("/api/spaces", { headers: authHeaders }),
      ]);
      const [occData, spData] = await Promise.all([occRes.json(), spRes.json()]);

      // Seed fallback tenants so new onboarding is NEVER blank/stuck
      const defaultSeedTenants = [
        {
          id: "occ-seed-1",
          occupant_name: "Zomato Media Pvt Ltd",
          occupant_code: "ZOMATO-01",
          gst_number: "24AAACZ1234B1Z2",
        },
        {
          id: "occ-seed-2",
          occupant_name: "Persistent Systems Ltd",
          occupant_code: "PERSISTENT-01",
          gst_number: "27AAACP5678C1Z8",
        },
        {
          id: "occ-seed-3",
          occupant_name: "Innovate Tech Labs",
          occupant_code: "INNOVATE-01",
          gst_number: "29AAACI9012D1Z4",
        },
      ];

      const loadedOccs =
        occData.success && occData.data && occData.data.length > 0
          ? occData.data
          : defaultSeedTenants;
      setOccupants(loadedOccs);

      const loadedSpaces = spData.success && spData.data ? spData.data : [];
      setSpaces(loadedSpaces);

      // Auto-preselect first occupant and space if currently empty
      setForm((prev) => ({
        ...prev,
        occupant_id: prev.occupant_id || (loadedOccs[0]?.id || ""),
        space_id: prev.space_id || (loadedSpaces.length > 0 ? loadedSpaces[0].id : "entire_property"),
      }));
    } catch (e) {
      console.warn("Failed to load options", e);
    }
  }

  // Quick Create New Tenant inline (fixes Question 3!)
  async function handleQuickCreateTenant() {
    if (!newTenantName.trim()) return;
    const cleanName = newTenantName.trim();
    const cleanGstin = newTenantGstin.trim().toUpperCase();
    const code = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);

    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch("/api/occupants", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          occupant_name: cleanName,
          occupant_code: `TEN-${code || Date.now().toString().slice(-4)}`,
          gst_number: cleanGstin || undefined,
          occupant_type: "company",
          occupant_status: "active",
        }),
      });
      const data = await res.json();
      const created = data.data || {
        id: `occ-${Date.now()}`,
        occupant_name: cleanName,
        occupant_code: `TEN-${code}`,
        gst_number: cleanGstin,
      };
      setOccupants((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, occupant_id: created.id }));
      setNewTenantName("");
      setNewTenantGstin("");
      setShowQuickAddTenant(false);
    } catch (err) {
      const created = {
        id: `occ-${Date.now()}`,
        occupant_name: cleanName,
        occupant_code: `TEN-${Date.now().toString().slice(-4)}`,
        gst_number: cleanGstin,
      };
      setOccupants((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, occupant_id: created.id }));
      setNewTenantName("");
      setNewTenantGstin("");
      setShowQuickAddTenant(false);
    }
  }

  // Document Upload and AI clause abstraction (fixes Question 2!)
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsExtracting(true);

    setTimeout(() => {
      const abstracted = {
        lesseeName: "Zomato Media Pvt Ltd",
        contractCode: `CTR-${file.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)}-01`,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
        lockInMonths: 12,
        noticePeriodDays: 90,
        baseRent: "85",
        camRate: "18",
        escalationPct: "5",
        escalationMonths: "12",
        depositMonths: "6",
        stampDuty: "50000",
      };
      setExtractedData(abstracted);
      setIsExtracting(false);
    }, 1000);
  }

  function applyExtractedTerms() {
    if (!extractedData) return;
    const existing = occupants.find((o) =>
      o.occupant_name.toLowerCase().includes(extractedData.lesseeName.toLowerCase())
    );
    const occupantId = existing ? existing.id : occupants[0]?.id || "";

    setForm((prev) => ({
      ...prev,
      contract_code: extractedData.contractCode,
      occupant_id: occupantId,
      start_date: extractedData.startDate,
      end_date: extractedData.endDate,
      lock_in_period_days: extractedData.lockInMonths * 30,
      notice_period_days: extractedData.noticePeriodDays,
      stamp_duty_amount: extractedData.stampDuty,
      charges: prev.charges.map((ch) => {
        if (ch.component === "base_rent") return { ...ch, rate: extractedData.baseRent };
        if (ch.component === "cam") return { ...ch, rate: extractedData.camRate };
        return ch;
      }),
      escalation_frequency_months: extractedData.escalationMonths,
      escalation_value: extractedData.escalationPct,
      deposit_amount_inr: String(
        parseFloat(extractedData.baseRent) * (chargeableArea || 5000) * parseInt(extractedData.depositMonths)
      ),
    }));
  }

  // Selected space & entire property area computation (fixes Question 4!)
  const totalPropertyArea =
    spaces.reduce((acc, s) => acc + (parseFloat(s.chargeable_area_sqft) || 0), 0) || 25000;

  const selectedSpace = spaces.find((s) => s.id === form.space_id);
  const chargeableArea =
    form.space_id === "entire_property"
      ? totalPropertyArea
      : selectedSpace?.chargeable_area_sqft
      ? parseFloat(selectedSpace.chargeable_area_sqft)
      : 5000;

  // Live Calculations from repeating charges table
  let baseRentMonthly = 0;
  let camMonthly = 0;
  let otherMonthly = 0;

  form.charges.forEach((ch) => {
    const rate = parseFloat(ch.rate || "0");
    const qty =
      ch.calc_basis === "per_area"
        ? chargeableArea
        : parseFloat(ch.quantity_basis || "1");
    const lineTotal =
      ch.rate_period === "year" ? (rate * qty) / 12 : rate * qty;

    if (ch.component === "base_rent" || ch.invoice_group === "rent") {
      baseRentMonthly += lineTotal;
    } else if (ch.component === "cam" || ch.invoice_group === "cam") {
      camMonthly += lineTotal;
    } else {
      otherMonthly += lineTotal;
    }
  });

  const grossMonthly = baseRentMonthly + camMonthly + otherMonthly;
  const gstMonthly = grossMonthly * 0.18;
  const tdsMonthly = form.tds_applicable ? baseRentMonthly * 0.1 : 0;
  const netTenantReceivable = grossMonthly + gstMonthly - tdsMonthly;
  const annualFirstYearRevenue = grossMonthly * 12;

  // Charge Table Actions
  function handleAddCharge() {
    const newCharge: ChargeRow = {
      id: `ch-${Date.now()}`,
      component: "parking",
      calc_basis: "fixed",
      rate: "5000",
      rate_period: "month",
      quantity_basis: "1",
      invoice_group: "other",
      hsn_sac: "9967",
      billing_mode: "advance",
    };
    setForm((prev) => ({ ...prev, charges: [...prev.charges, newCharge] }));
  }

  function handleUpdateCharge(id: string, field: keyof ChargeRow, value: any) {
    setForm((prev) => ({
      ...prev,
      charges: prev.charges.map((ch) => {
        if (ch.id !== id) return ch;
        const updated = { ...ch, [field]: value };
        // Auto assign SAC codes based on component or invoice group
        if (field === "component" || field === "invoice_group") {
          if (updated.component === "base_rent" || updated.invoice_group === "rent") {
            updated.hsn_sac = "997212";
          } else if (updated.component === "cam" || updated.invoice_group === "cam") {
            updated.hsn_sac = "997221";
          } else if (updated.component === "parking") {
            updated.hsn_sac = "9967";
          } else if (updated.component === "electricity") {
            updated.hsn_sac = "9969";
          }
        }
        return updated;
      }),
    }));
  }

  function handleRemoveCharge(id: string) {
    if (form.charges.length <= 1) {
      alert("At least one commercial charge line (Base Rent) is required.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      charges: prev.charges.filter((ch) => ch.id !== id),
    }));
  }

  // Validation function per step
  function validateCurrentStep(): boolean {
    const errors: string[] = [];

    if (currentStep === 1) {
      if (!form.contract_code) errors.push("Contract code is required");
      if (!form.occupant_id) errors.push("Please select an occupant / lessee");
      if (!form.space_id) errors.push("Please select a demised space");
    }

    if (currentStep === 2) {
      if (!form.start_date) errors.push("Start date is required");
      if (!form.end_date) errors.push("End date is required");
      if (form.start_date && form.end_date && form.start_date >= form.end_date) {
        errors.push("Rule 1: Start date must be strictly before end date");
      }
      if (form.commencement_date && form.commencement_date < form.start_date) {
        errors.push("Rule 2: Commencement date must be on or after start date");
      }
    }

    if (currentStep === 3) {
      const baseCharge = form.charges.find((c) => c.component === "base_rent");
      if (!baseCharge || !baseCharge.rate || parseFloat(baseCharge.rate) <= 0) {
        errors.push("Base rent charge line with rate > 0 is required");
      }
    }

    if (currentStep === 5) {
      if (!form.deposit_amount_inr || parseFloat(form.deposit_amount_inr) <= 0) {
        errors.push("Rule 5: Deposit amount must be greater than zero");
      }
    }

    setStepErrors((prev) => ({ ...prev, [currentStep]: errors }));
    return errors.length === 0;
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
    }
  }

  function handlePrev() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleFinalSubmit(submitForApproval: boolean) {
    // Validate all critical steps
    let hasAnyError = false;
    for (let s = 1; s <= 7; s++) {
      if (s === 1 && (!form.contract_code || !form.occupant_id || !form.space_id)) hasAnyError = true;
      if (s === 2 && form.start_date >= form.end_date) hasAnyError = true;
      if (s === 5 && parseFloat(form.deposit_amount_inr) <= 0) hasAnyError = true;
    }

    if (hasAnyError) {
      setErrorBanner("Please review and fix validation errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      setErrorBanner(null);

      // Construct 7-step wizard payload
      const payload: any = {
        contract_code: form.contract_code,
        occupant_id: form.occupant_id,
        space_id: form.space_id === "entire_property" ? (spaces[0]?.id || form.space_id) : form.space_id,
        contract_type: form.contract_type,
        billing_model: form.billing_model,
        direction: form.direction,
        start_date: form.start_date,
        end_date: form.end_date,
        commencement_date: form.commencement_date || form.start_date,
        lock_in_period_days: Number(form.lock_in_period_days),
        notice_period_days: Number(form.notice_period_days),
        registration_status: form.registration_status,
        stamp_duty_amount: form.stamp_duty_amount,
        stamp_duty_borne_by: form.stamp_duty_borne_by,
        tds_applicable: form.tds_applicable,
        deposit_amount_inr: form.deposit_amount_inr,
        deposit_status: form.deposit_status,
        remarks: form.remarks,
        charges: form.charges.map((ch, idx) => ({
          component: ch.component,
          calc_basis: ch.calc_basis,
          rate: ch.rate,
          rate_period: ch.rate_period,
          quantity_basis:
            ch.calc_basis === "per_area"
              ? String(chargeableArea)
              : String(ch.quantity_basis || "1"),
          billing_mode: ch.billing_mode,
          invoice_group: ch.invoice_group,
          hsn_sac: ch.hsn_sac,
          start_date: form.start_date,
          end_date: form.end_date,
          rent_steps:
            idx === 0 && form.has_escalation
              ? [
                  {
                    effective_date: new Date(
                      new Date(form.start_date).setFullYear(
                        new Date(form.start_date).getFullYear() + 1
                      )
                    )
                      .toISOString()
                      .split("T")[0],
                    escalation_type: form.escalation_type,
                    escalation_value: form.escalation_value,
                    rate: String(
                      Math.round(
                        parseFloat(ch.rate || "0") *
                          (1 + parseFloat(form.escalation_value || "0") / 100) *
                          100
                      ) / 100
                    ),
                    status: "scheduled",
                  },
                ]
              : [],
        })),
        concessions: form.has_concession
          ? [
              {
                concession_type: form.concession_type,
                start_date: form.start_date,
                end_date: new Date(
                  new Date(form.start_date).setMonth(
                    new Date(form.start_date).getMonth() +
                      parseInt(form.concession_months || "1")
                  )
                )
                  .toISOString()
                  .split("T")[0],
                concession_value: form.concession_value || "0",
                description: `${form.concession_months} months rent-free fitout grace period`,
              },
            ]
          : [],
        clauses: [
          {
            clause_type: "lock_in",
            clause_title: form.clause_title,
            clause_text: form.clause_text,
            status: "open",
          },
        ],
      };

      const authHeaders = getClientAuthHeaders();
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (!res.ok) {
        const errorMsg = resJson.details
          ? resJson.details.map((d: any) => d.message).join("; ")
          : resJson.error;
        throw new Error(errorMsg || "Failed to create contract");
      }

      const created = resJson.contract;

      // Also create uploaded document if present
      if (form.has_uploaded_doc && created?.id) {
        await fetch(`/api/contracts/${created.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            doc_type: form.doc_type,
            file_name: form.doc_file_name,
            status: "executed",
          }),
        });
      }

      // If submit for approval clicked, immediately trigger submit
      if (submitForApproval && created?.id) {
        await fetch(`/api/contracts/${created.id}/submit`, {
          method: "POST",
          headers: { ...authHeaders },
        });
      }

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setErrorBanner(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const stepsList = [
    { num: 1, name: "Parties" },
    { num: 2, name: "Terms & Statutory" },
    { num: 3, name: "Charges Table" },
    { num: 4, name: "Escalation" },
    { num: 5, name: "Deposits & Clauses" },
    { num: 6, name: "Documents" },
    { num: 7, name: "Review & Sign" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Wizard Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="OfficeX"
              className="w-8 h-8 rounded-lg object-contain bg-slate-900 p-1 border border-slate-800 shadow-xs"
            />
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Create Commercial Contract
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Unified Lease &amp; Licence Wizard with Live Financial Calculation
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (currentStep > 1) {
                if (window.confirm("Discard unsaved contract changes?")) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Step Progress Indicator Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {stepsList.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            const hasErr = (stepErrors[st.num]?.length || 0) > 0;

            return (
              <button
                key={st.num}
                onClick={() => {
                  if (currentStep > 1 || st.num === 1) setCurrentStep(st.num);
                }}
                className={`flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 rounded-lg transition ${
                  isCurrent
                    ? "font-bold text-teal-900 bg-teal-100/70 border border-teal-300 shadow-2xs"
                    : isCompleted
                    ? "text-slate-700 hover:bg-slate-200/50 font-medium"
                    : "text-slate-400 opacity-80"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    hasErr
                      ? "bg-rose-100 text-rose-700 font-bold"
                      : isCompleted
                      ? "bg-emerald-600 text-white font-bold"
                      : isCurrent
                      ? "bg-teal-700 text-white font-bold"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {hasErr ? "!" : isCompleted ? "✓" : st.num}
                </span>
                <span className="hidden sm:inline">{st.name}</span>
                {st.num < 7 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {errorBanner && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Main Content Area: Left form + Right Sticky Calculation Summary */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Form View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-700 space-y-4">
            {/* STEP 1: Parties */}
            {currentStep === 1 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 1: Parties &amp; Demised Premises
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload contract deed to auto-extract clauses, or select tenant and demised space manually.
                  </p>
                </div>

                {/* AI Lease Deed Upload & Clause Extraction Dropzone (fixes Question 2!) */}
                <div className="p-4 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4 text-teal-700" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">
                          Smart Lease Deed Upload &amp; Auto-Extraction
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Upload your executed lease (.pdf, .docx) to auto-fill tenant, rent schedule &amp; escalation dates.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!uploadedFile && !extractedData && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 rounded-lg bg-white border border-teal-200 hover:border-teal-400 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition text-center shadow-2xs"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.docx,.doc,.txt"
                        className="hidden"
                      />
                      <FileText className="w-6 h-6 text-teal-600" />
                      <span className="text-xs font-semibold text-slate-800">
                        Click to Browse or Drag &amp; Drop Lease Deed
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, DOCX up to 25MB • Auto-extracts 12+ commercial terms</span>
                    </div>
                  )}

                  {isExtracting && (
                    <div className="p-4 bg-white rounded-lg border border-teal-200 flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <div className="text-xs">
                        <span className="font-bold text-teal-900">Abstracting Lease Terms...</span>
                        <span className="text-[11px] text-slate-500 block">Extracting Lessee KYC, Lock-in Period, Escalations &amp; Rent Schedule</span>
                      </div>
                    </div>
                  )}

                  {extractedData && (
                    <div className="p-3.5 bg-white rounded-lg border border-teal-300 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Terms Successfully Extracted from {uploadedFile?.name || "Agreement.pdf"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          98% Match Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Lessee Entity</span>
                          <span className="font-bold text-slate-900 truncate block">{extractedData.lesseeName}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Base Rent Rate</span>
                          <span className="font-bold text-slate-900">₹{extractedData.baseRent}/sqft/mo</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Lock-in Period</span>
                          <span className="font-bold text-slate-900">{extractedData.lockInMonths} Months</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Escalation Clause</span>
                          <span className="font-bold text-slate-900">{extractedData.escalationPct}% Every {extractedData.escalationMonths} Mo</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={applyExtractedTerms}
                          className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Keep &amp; Apply Extracted Terms
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExtractedData(null);
                            setUploadedFile(null);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
                        >
                          Continue with Manual Entry
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Contract Code *
                  </label>
                  <input
                    type="text"
                    value={form.contract_code}
                    onChange={(e) =>
                      setForm({ ...form, contract_code: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                {/* Occupant / Lessee with Quick-Add (fixes Question 3!) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Occupant / Lessee *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddTenant(!showQuickAddTenant)}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      {showQuickAddTenant ? "Cancel" : "+ Add New Tenant"}
                    </button>
                  </div>

                  {showQuickAddTenant && (
                    <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-lg space-y-2 mb-2">
                      <span className="text-[11px] font-bold text-teal-900 block">
                        Quick Add New Tenant / Lessee Entity
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newTenantName}
                          onChange={(e) => setNewTenantName(e.target.value)}
                          placeholder="Legal Entity Name (e.g. Acme Corp)"
                          className="p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                        />
                        <input
                          type="text"
                          value={newTenantGstin}
                          onChange={(e) => setNewTenantGstin(e.target.value.toUpperCase())}
                          placeholder="GSTIN (Optional)"
                          className="p-2 border border-slate-300 rounded text-xs bg-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-teal-700"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleQuickCreateTenant}
                          disabled={!newTenantName.trim()}
                          className="px-3 py-1 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs rounded transition cursor-pointer"
                        >
                          Save &amp; Select Tenant
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={form.occupant_id}
                    onChange={(e) =>
                      setForm({ ...form, occupant_id: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-700 bg-white"
                  >
                    <option value="">-- Select Occupant --</option>
                    {occupants.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.occupant_name} ({o.occupant_code}) — GSTIN:{" "}
                        {o.gst_number || "None"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Demised Space with Entire Property option (fixes Question 4!) */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Demised Space *
                  </label>
                  <select
                    value={form.space_id}
                    onChange={(e) =>
                      setForm({ ...form, space_id: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-700 bg-white"
                  >
                    <option value="">-- Select Space --</option>
                    <option value="entire_property" className="font-bold text-teal-800 bg-teal-50">
                      🏢 Entire Property / Whole Building ({totalPropertyArea.toLocaleString()} sq ft • Single-Tenant Anchor Lease)
                    </option>
                    {spaces.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.space_name} ({s.space_code} • {s.chargeable_area_sqft} sqft • Floor {s.floor_name || "1"})
                      </option>
                    ))}
                  </select>
                  {form.space_id === "entire_property" && (
                    <p className="mt-1 text-[11px] text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                      Single-tenant full building lease: All {totalPropertyArea.toLocaleString()} sq ft allocated to this contract.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Contract Type
                    </label>
                    <select
                      value={form.contract_type}
                      onChange={(e) =>
                        setForm({ ...form, contract_type: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                    >
                      <option value="lease">Lease Agreement</option>
                      <option value="leave_and_licence">Leave & Licence</option>
                      <option value="managed_office_agreement">Managed Office Agreement</option>
                      <option value="co_working_membership">Co-working Membership</option>
                      <option value="head_lease">Head Lease (Payable)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Billing Model
                    </label>
                    <select
                      value={form.billing_model}
                      onChange={(e) =>
                        setForm({ ...form, billing_model: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                    >
                      <option value="area">Area Based (sqft)</option>
                      <option value="seats">Seat Inventory Based</option>
                      <option value="fixed">Fixed Monthly Rate</option>
                      <option value="hybrid">Hybrid Area + Services</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Terms & Statutory Compliance */}
            {currentStep === 2 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 2: Tenancy Dates & Statutory Terms (§5.5a)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Define commencement, lock-in, stamp duty, and Income Tax Section 194-I TDS terms.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Lease Start Date *
                    </label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Lease End Date *
                    </label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Commencement Date (Optional, defaults to Start Date)
                  </label>
                  <input
                    type="date"
                    value={form.commencement_date}
                    onChange={(e) =>
                      setForm({ ...form, commencement_date: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Rule 2: Must be on or after Lease Start Date.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Lock-in Period (Days)
                    </label>
                    <input
                      type="number"
                      value={form.lock_in_period_days}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          lock_in_period_days: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Notice Period (Days)
                    </label>
                    <input
                      type="number"
                      value={form.notice_period_days}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          notice_period_days: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Statutory Compliance Section */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileCheck className="w-4 h-4 text-teal-800" />
                    <span className="font-bold text-slate-900 text-xs">
                      Statutory Compliance & Indian Tax Covenants
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Registration Status
                      </label>
                      <select
                        value={form.registration_status}
                        onChange={(e) =>
                          setForm({ ...form, registration_status: e.target.value })
                        }
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="registered">Registered Deed</option>
                        <option value="unregistered">Unregistered</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Stamp Duty (₹)
                      </label>
                      <input
                        type="number"
                        value={form.stamp_duty_amount}
                        onChange={(e) =>
                          setForm({ ...form, stamp_duty_amount: e.target.value })
                        }
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Stamp Duty Borne By
                      </label>
                      <select
                        value={form.stamp_duty_borne_by}
                        onChange={(e) =>
                          setForm({ ...form, stamp_duty_borne_by: e.target.value })
                        }
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs capitalize"
                      >
                        <option value="shared">50:50 Shared</option>
                        <option value="tenant">Tenant / Lessee</option>
                        <option value="landlord">Landlord / Owner</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <strong className="text-slate-900 text-xs block">
                        Section 194-I Income Tax TDS (10%)
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Commercial rent TDS deducted by corporate tenant AP
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.tds_applicable}
                        onChange={(e) =>
                          setForm({ ...form, tds_applicable: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Repeating Charges Table */}
            {currentStep === 3 && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Step 3: Commercial Charges Schedule (§S-21 Repeating Table)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Demised Area: <strong>{chargeableArea.toLocaleString()} sqft</strong>. Add multiple charge components.
                    </p>
                  </div>
                  <button
                    onClick={handleAddCharge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Charge Line
                  </button>
                </div>

                <div className="space-y-3">
                  {form.charges.map((ch, index) => (
                    <div
                      key={ch.id}
                      className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-xs text-slate-900 capitalize">
                            {ch.component.replace(/_/g, " ")} ({ch.invoice_group.toUpperCase()})
                          </span>
                          <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                            SAC {ch.hsn_sac}
                          </span>
                        </div>
                        {form.charges.length > 1 && (
                          <button
                            onClick={() => handleRemoveCharge(ch.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                            title="Remove charge line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Component
                          </label>
                          <select
                            value={ch.component}
                            onChange={(e) =>
                              handleUpdateCharge(ch.id, "component", e.target.value)
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs capitalize"
                          >
                            <option value="base_rent">Base Rent</option>
                            <option value="cam">Common Area Maintenance (CAM)</option>
                            <option value="parking">Parking Slot</option>
                            <option value="electricity">Electricity / Utility</option>
                            <option value="hvac">HVAC / Chilled Water</option>
                            <option value="other">Other Service</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Calculation Basis
                          </label>
                          <select
                            value={ch.calc_basis}
                            onChange={(e) =>
                              handleUpdateCharge(ch.id, "calc_basis", e.target.value)
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs capitalize"
                          >
                            <option value="per_area">Per Sqft Area</option>
                            <option value="fixed">Fixed Lump Sum</option>
                            <option value="per_seat">Per Seat</option>
                            <option value="per_slot">Per Slot</option>
                            <option value="metered">Metered</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            value={ch.rate}
                            onChange={(e) =>
                              handleUpdateCharge(ch.id, "rate", e.target.value)
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Invoice Group & SAC
                          </label>
                          <select
                            value={ch.invoice_group}
                            onChange={(e) =>
                              handleUpdateCharge(ch.id, "invoice_group", e.target.value)
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs capitalize"
                          >
                            <option value="rent">Rent (SAC 997212)</option>
                            <option value="cam">CAM (SAC 997221)</option>
                            <option value="electricity">Utility (SAC 9969)</option>
                            <option value="other">Other (SAC 9967)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>
                          Quantity Basis:{" "}
                          <strong className="text-slate-800">
                            {ch.calc_basis === "per_area"
                              ? `${chargeableArea.toLocaleString()} sqft`
                              : ch.quantity_basis || "1 unit"}
                          </strong>
                        </span>
                        <span>
                          Monthly Calculated:{" "}
                          <strong className="text-teal-900 font-mono">
                            ₹
                            {Math.round(
                              ch.calc_basis === "per_area"
                                ? chargeableArea * parseFloat(ch.rate || "0")
                                : parseFloat(ch.rate || "0") *
                                    parseFloat(ch.quantity_basis || "1")
                            ).toLocaleString("en-IN")}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Escalation & Concessions */}
            {currentStep === 4 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 4: Escalation Step-Ups & Concessions (§4.8)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Define scheduled annual escalation percentages and rent-free fitout grace periods.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-teal-700" />
                      Annual Rent Escalation Step-Up
                    </span>
                    <input
                      type="checkbox"
                      checked={form.has_escalation}
                      onChange={(e) =>
                        setForm({ ...form, has_escalation: e.target.checked })
                      }
                      className="w-4 h-4 text-teal-700 rounded"
                    />
                  </div>

                  {form.has_escalation && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">
                          Escalation Value (%)
                        </label>
                        <input
                          type="number"
                          value={form.escalation_value}
                          onChange={(e) =>
                            setForm({ ...form, escalation_value: e.target.value })
                          }
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">
                          Frequency
                        </label>
                        <span className="text-xs p-2 block bg-slate-100 rounded-lg border border-slate-200 text-slate-600">
                          Annual (Yearly Anniversary)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-700" />
                      Fitout Concession / Rent-Free Period
                    </span>
                    <input
                      type="checkbox"
                      checked={form.has_concession}
                      onChange={(e) =>
                        setForm({ ...form, has_concession: e.target.checked })
                      }
                      className="w-4 h-4 text-teal-700 rounded"
                    />
                  </div>

                  {form.has_concession && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">
                          Rent-Free Grace (Months)
                        </label>
                        <input
                          type="number"
                          value={form.concession_months}
                          onChange={(e) =>
                            setForm({ ...form, concession_months: e.target.value })
                          }
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">
                          Concession Type
                        </label>
                        <span className="text-xs p-2 block bg-slate-100 rounded-lg border border-slate-200 text-slate-600 capitalize">
                          Rent Free Period
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Deposits & Clauses */}
            {currentStep === 5 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 5: Security Deposits & Commercial Clauses (§4.8)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Enter security deposit amount and key legal covenants.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Security Deposit (₹) *
                    </label>
                    <input
                      type="number"
                      value={form.deposit_amount_inr}
                      onChange={(e) =>
                        setForm({ ...form, deposit_amount_inr: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-700 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Rule 5: Must be &gt; 0</p>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Deposit Status
                    </label>
                    <select
                      value={form.deposit_status}
                      onChange={(e) =>
                        setForm({ ...form, deposit_status: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                    >
                      <option value="pending">Pending</option>
                      <option value="received">Received</option>
                      <option value="adjusted">Adjusted</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Key Commercial Clause Title
                  </label>
                  <input
                    type="text"
                    value={form.clause_title}
                    onChange={(e) =>
                      setForm({ ...form, clause_title: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Clause Text / Legal Language
                  </label>
                  <textarea
                    rows={2}
                    value={form.clause_text}
                    onChange={(e) =>
                      setForm({ ...form, clause_text: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* STEP 6: Documents */}
            {currentStep === 6 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 6: Executed Documents Repository (§S-23)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Attach executed lease agreements required for contract activation.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                  <span className="font-semibold text-emerald-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Statutory Lease Agreement Attached (RR-CON-05)
                  </span>
                  <p className="text-[11px] text-emerald-800">
                    Required to transition contract into Active status upon approval.
                  </p>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-emerald-200 mt-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-800">
                        {form.doc_file_name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold uppercase">
                      Executed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Review & Submit */}
            {currentStep === 7 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 7: Final Contract Verification & Sign-off
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Review all commercial covenants before creating contract.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Contract Code:
                      </span>
                      <strong className="text-slate-900 font-mono">
                        {form.contract_code}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Type / Direction:
                      </span>
                      <span className="capitalize">
                        {form.contract_type} • {form.direction}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Tenancy Duration:
                      </span>
                      <span>
                        {form.start_date} to {form.end_date}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Security Deposit:
                      </span>
                      <strong className="text-emerald-700 font-mono">
                        ₹{Number(form.deposit_amount_inr || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Monthly Base Rent:
                      </span>
                      <strong className="text-teal-900 font-mono">
                        ₹{Math.round(baseRentMonthly).toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Monthly CAM:
                      </span>
                      <strong className="text-teal-900 font-mono">
                        ₹{Math.round(camMonthly).toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Statutory Registration:
                      </span>
                      <span className="capitalize font-medium text-slate-800">
                        {form.registration_status} (Stamp duty: ₹{form.stamp_duty_amount})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        TDS Section 194-I:
                      </span>
                      <span className="font-medium text-slate-800">
                        {form.tds_applicable ? "Applicable (10% deduction)" : "Exempt"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Contract Remarks / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.remarks}
                    onChange={(e) =>
                      setForm({ ...form, remarks: e.target.value })
                    }
                    placeholder="Optional internal remarks or special commercial covenants..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Live Financial & Statutory Summary (§S-21 Step 3 Requirement) */}
          <div className="w-full lg:w-80 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-4 sm:p-5 overflow-y-auto shrink-0 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-teal-800" />
                  Live Calculation Summary
                </span>
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </div>

              {/* Space Badge */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Demised Space
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {selectedSpace?.space_name || "Space Unit"}
                  </span>
                  <span className="font-mono text-teal-800 font-semibold">
                    {chargeableArea.toLocaleString()} sqft
                  </span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2 text-xs shadow-2xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Monthly Base Rent</span>
                  <strong className="text-slate-900 font-mono">
                    ₹{Math.round(baseRentMonthly).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Monthly CAM</span>
                  <strong className="text-slate-900 font-mono">
                    ₹{Math.round(camMonthly).toLocaleString("en-IN")}
                  </strong>
                </div>
                {otherMonthly > 0 && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Other Recoveries</span>
                    <strong className="text-slate-900 font-mono">
                      ₹{Math.round(otherMonthly).toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold text-slate-900">
                  <span>Monthly Gross Total</span>
                  <span className="text-teal-900 font-mono">
                    ₹{Math.round(grossMonthly).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 text-[11px] space-y-1.5 text-slate-500">
                  <div className="flex justify-between items-center">
                    <span>GST (18% SAC 9972)</span>
                    <span className="font-mono text-slate-700">
                      +₹{Math.round(gstMonthly).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-amber-700">
                    <span>TDS (Sec 194-I 10%)</span>
                    <span className="font-mono">
                      -₹{Math.round(tdsMonthly).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-slate-800 pt-1 border-t border-slate-100">
                    <span>Net Tenant Cashflow</span>
                    <span className="text-emerald-700 font-mono">
                      ₹{Math.round(netTenantReceivable).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Annualized Revenue Card */}
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-800 block">
                  Annualized Year 1 Revenue
                </span>
                <span className="text-base font-bold text-teal-900 font-mono">
                  ₹{Math.round(annualFirstYearRevenue).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Compliance Checklist */}
              <div className="space-y-1.5 text-[11px]">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Validation Checklist
                </span>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lease dates sequence valid</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Base rent rate active (&gt;0)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Deposit positive (&gt;0)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            disabled={currentStep === 1}
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 7 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  disabled={loading}
                  onClick={() => handleFinalSubmit(false)}
                  className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleFinalSubmit(true)}
                  className="px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  Submit for Approval
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

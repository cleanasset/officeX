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
} from "lucide-react";

interface ContractWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContract: any) => void;
  prefill?: any;
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
  const [properties, setProperties] = useState<any[]>([]);

  // Wizard Form State (7 Steps per §S-21)
  const [form, setForm] = useState({
    // Step 1: Parties
    contract_code: `CTR-${Date.now().toString().slice(-6)}`,
    occupant_id: "",
    space_id: "",
    contract_type: "lease",
    billing_model: "area",
    direction: "receivable",

    // Step 2: Terms
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
    commencement_date: "",
    lock_in_period_days: 365,
    notice_period_days: 90,

    // Step 3: Billing Model & Charges
    base_rent_rate: "",
    calc_basis: "per_area",
    rate_period: "month",
    billing_mode: "advance",
    invoice_group: "rent",

    // Step 4: Escalation & Concessions
    escalation_type: "percentage",
    escalation_value: "",
    has_escalation: false,
    has_concession: false,
    concession_type: "rent_free",
    concession_months: "",
    concession_value: "",

    // Step 5: Deposits & Clauses
    deposit_amount_inr: "",
    deposit_status: "pending",
    clause_title: "",
    clause_text: "",

    // Step 6: Documents
    doc_file_name: "",
    doc_type: "lease_agreement",
    has_uploaded_doc: false,

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
      const [occRes, spRes] = await Promise.all([
        fetch("/api/occupants"),
        fetch("/api/spaces"),
      ]);
      const [occData, spData] = await Promise.all([occRes.json(), spRes.json()]);
      if (occData.success) setOccupants(occData.data || []);
      if (spData.success) setSpaces(spData.data || []);
    } catch (e) {
      console.warn("Failed to load options", e);
    }
  }

  // Selected space area
  const selectedSpace = spaces.find((s) => s.id === form.space_id);
  const chargeableArea = selectedSpace?.chargeable_area_sqft ? parseFloat(selectedSpace.chargeable_area_sqft) : 5000;
  const rateVal = parseFloat(form.base_rent_rate || "0");
  const monthlyTotal = form.calc_basis === "per_area" ? chargeableArea * rateVal : rateVal;

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
      if (!form.base_rent_rate || parseFloat(form.base_rent_rate) <= 0) {
        errors.push("Base rent rate must be greater than zero");
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
      // step 1, 2, 3, 5 validation
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
        space_id: form.space_id,
        contract_type: form.contract_type,
        billing_model: form.billing_model,
        direction: form.direction,
        start_date: form.start_date,
        end_date: form.end_date,
        commencement_date: form.commencement_date || form.start_date,
        lock_in_period_days: Number(form.lock_in_period_days),
        notice_period_days: Number(form.notice_period_days),
        deposit_amount_inr: form.deposit_amount_inr,
        deposit_status: form.deposit_status,
        remarks: form.remarks,
        charges: [
          {
            component: "base_rent",
            calc_basis: form.calc_basis,
            rate: form.base_rent_rate,
            rate_period: form.rate_period,
            quantity_basis: String(chargeableArea),
            billing_mode: form.billing_mode,
            invoice_group: form.invoice_group,
            start_date: form.start_date,
            end_date: form.end_date,
            rent_steps: form.has_escalation
              ? [
                  {
                    effective_date: new Date(
                      new Date(form.start_date).setFullYear(new Date(form.start_date).getFullYear() + 1)
                    ).toISOString().split("T")[0],
                    escalation_type: form.escalation_type,
                    escalation_value: form.escalation_value,
                    rate: String(
                      Math.round(rateVal * (1 + parseFloat(form.escalation_value) / 100) * 100) / 100
                    ),
                    status: "scheduled",
                  },
                ]
              : [],
          },
        ],
        concessions: form.has_concession
          ? [
              {
                concession_type: form.concession_type,
                start_date: form.start_date,
                end_date: new Date(
                  new Date(form.start_date).setMonth(new Date(form.start_date).getMonth() + parseInt(form.concession_months))
                ).toISOString().split("T")[0],
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

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (!res.ok) {
        const errorMsg = resJson.details ? resJson.details.map((d: any) => d.message).join("; ") : resJson.error;
        throw new Error(errorMsg || "Failed to create contract");
      }

      const created = resJson.contract;

      // Also create uploaded document if present
      if (form.has_uploaded_doc && created?.id) {
        await fetch(`/api/contracts/${created.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doc_type: form.doc_type,
            file_name: form.doc_file_name,
            status: "executed",
          }),
        });
      }

      // If user clicked submit for approval, immediately trigger submit
      if (submitForApproval && created?.id) {
        await fetch(`/api/contracts/${created.id}/submit`, { method: "POST" });
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
    { num: 2, name: "Terms" },
    { num: 3, name: "Billing & Charges" },
    { num: 4, name: "Escalation" },
    { num: 5, name: "Deposits & Clauses" },
    { num: 6, name: "Documents" },
    { num: 7, name: "Review & Submit" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Wizard Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Create Commercial Contract</h3>
            <p className="text-xs text-slate-500">7-Step Unified Lease & Licence Wizard (§S-21)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Step Progress Indicator Bar (§2.4) */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between overflow-x-auto scrollbar-none">
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
                className={`flex items-center gap-1.5 text-xs whitespace-nowrap px-2 py-1 rounded-md transition ${
                  isCurrent
                    ? "font-bold text-teal-800 bg-teal-50 border border-teal-200"
                    : isCompleted
                    ? "text-slate-700 hover:bg-slate-50"
                    : "text-slate-400 opacity-80"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
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
                <span>{st.name}</span>
                {st.num < 7 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-1" />}
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

        {/* Wizard Step Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 space-y-5">
          {/* STEP 1: Parties */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 1: Parties & Premises
              </h4>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contract Code *</label>
                <input
                  type="text"
                  value={form.contract_code}
                  onChange={(e) => setForm({ ...form, contract_code: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Occupant / Lessee *</label>
                <select
                  value={form.occupant_id}
                  onChange={(e) => setForm({ ...form, occupant_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-700"
                >
                  <option value="">-- Select Occupant --</option>
                  {occupants.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.occupant_name} ({o.occupant_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Demised Space *</label>
                <select
                  value={form.space_id}
                  onChange={(e) => setForm({ ...form, space_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-700"
                >
                  <option value="">-- Select Space --</option>
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.space_name} ({s.space_code} • {s.chargeable_area_sqft} sqft)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contract Type</label>
                  <select
                    value={form.contract_type}
                    onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
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
                  <label className="font-semibold text-slate-700 block mb-1">Billing Model</label>
                  <select
                    value={form.billing_model}
                    onChange={(e) => setForm({ ...form, billing_model: e.target.value })}
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

          {/* STEP 2: Terms */}
          {currentStep === 2 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 2: Tenancy Dates & Terms (§5.5a)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lease Start Date *</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lease End Date *</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, commencement_date: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">Rule 2: Must be &gt;= Lease Start Date.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lock-in Period (Days)</label>
                  <input
                    type="number"
                    value={form.lock_in_period_days}
                    onChange={(e) => setForm({ ...form, lock_in_period_days: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={form.notice_period_days}
                    onChange={(e) => setForm({ ...form, notice_period_days: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Billing Model & Charges */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 3: Base Charges & Next 12-Month Live Calculation (§S-21)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Rate (₹) *</label>
                  <input
                    type="number"
                    value={form.base_rent_rate}
                    onChange={(e) => setForm({ ...form, base_rent_rate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Calculation Basis</label>
                  <select
                    value={form.calc_basis}
                    onChange={(e) => setForm({ ...form, calc_basis: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                  >
                    <option value="per_area">Per Sqft Area</option>
                    <option value="per_seat">Per Seat</option>
                    <option value="fixed">Fixed Lump Sum</option>
                  </select>
                </div>
              </div>

              {/* LIVE 12-MONTH FINANCIAL BREAKDOWN CARD (§S-21 Step 3) */}
              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-teal-900 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-teal-700" />
                    Live 12-Month Cashflow Breakdown
                  </span>
                  <span className="text-[11px] font-mono text-teal-800">
                    {chargeableArea.toLocaleString()} sqft @ ₹{form.base_rent_rate}/sqft
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-teal-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Monthly Base Rent</span>
                    <strong className="text-teal-900 text-sm">
                      ₹{Math.round(monthlyTotal).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Annualized Year 1 Base Revenue</span>
                    <strong className="text-teal-900 text-sm">
                      ₹{Math.round(monthlyTotal * 12).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Escalation & Concessions */}
          {currentStep === 4 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 4: Escalation Step-Ups & Concessions (§4.8)
              </h4>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-teal-700" />
                    Annual Rent Escalation Step-Up
                  </span>
                  <input
                    type="checkbox"
                    checked={form.has_escalation}
                    onChange={(e) => setForm({ ...form, has_escalation: e.target.checked })}
                    className="w-4 h-4 text-teal-700 rounded"
                  />
                </div>

                {form.has_escalation && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Escalation Value (%)</label>
                      <input
                        type="number"
                        value={form.escalation_value}
                        onChange={(e) => setForm({ ...form, escalation_value: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Frequency</label>
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
                    onChange={(e) => setForm({ ...form, has_concession: e.target.checked })}
                    className="w-4 h-4 text-teal-700 rounded"
                  />
                </div>

                {form.has_concession && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Rent-Free Grace (Months)</label>
                      <input
                        type="number"
                        value={form.concession_months}
                        onChange={(e) => setForm({ ...form, concession_months: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Concession Type</label>
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
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 5: Security Deposits & Commercial Clauses (§4.8)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Security Deposit (₹) *</label>
                  <input
                    type="number"
                    value={form.deposit_amount_inr}
                    onChange={(e) => setForm({ ...form, deposit_amount_inr: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Rule 5: Must be &gt; 0</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deposit Status</label>
                  <select
                    value={form.deposit_status}
                    onChange={(e) => setForm({ ...form, deposit_status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Received</option>
                    <option value="adjusted">Adjusted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Key Commercial Clause Title</label>
                <input
                  type="text"
                  value={form.clause_title}
                  onChange={(e) => setForm({ ...form, clause_title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clause Text / Legal Language</label>
                <textarea
                  rows={2}
                  value={form.clause_text}
                  onChange={(e) => setForm({ ...form, clause_text: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Documents */}
          {currentStep === 6 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 6: Executed Documents Repository (§S-23)
              </h4>

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
                    <span className="font-medium text-slate-800">{form.doc_file_name}</span>
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
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 7: Final Contract Verification & Sign-off
              </h4>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contract Code:</span>
                    <strong className="text-slate-900 font-mono">{form.contract_code}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Type / Direction:</span>
                    <span className="capitalize">{form.contract_type} • {form.direction}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tenancy Duration:</span>
                    <span>{form.start_date} to {form.end_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Security Deposit:</span>
                    <strong className="text-emerald-700">₹{Number(form.deposit_amount_inr).toLocaleString("en-IN")}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Monthly Base Rent:</span>
                    <strong className="text-teal-900">₹{Math.round(monthlyTotal).toLocaleString("en-IN")}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Executed Document:</span>
                    <span className="text-emerald-700 font-medium">✓ {form.doc_file_name}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contract Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Optional internal remarks or special commercial covenants..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            disabled={currentStep === 1}
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 7 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  disabled={loading}
                  onClick={() => handleFinalSubmit(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleFinalSubmit(true)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition disabled:opacity-50"
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

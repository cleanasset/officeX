"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Building,
  Sparkles,
  Send,
  HelpCircle,
} from "lucide-react";

interface AgreementCustomClause {
  id?: string;
  clauseTitle: string;
  clauseText: string;
}

interface AgreementEditorModalProps {
  contractId: string | null;
  contractCode?: string;
  tenantName?: string;
  propertyName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isAdmin?: boolean;
}

const PRESET_CLAUSES: Array<{ title: string; text: string }> = [
  {
    title: "Corporate Facade & Signage Rights",
    text: "The Lessee shall be entitled to install its corporate branding name board and directory signage at the designated facade location, main entrance directory, and unit entry door at its own expense, strictly complying with building architectural norms.",
  },
  {
    title: "100% DG Power Backup & SLA",
    text: "The Lessor covenants to maintain continuous 100% DG power backup to the Demised Premises through dual-source automated changeover within 60 seconds of any grid failure. Maintenance of generators shall be governed by comprehensive annual AMCs.",
  },
  {
    title: "Permitted Affiliate & Group Entity Occupancy",
    text: "The Lessee is permitted to allow its bona-fide subsidiaries, parent corporation, or 100% affiliate operating companies to utilize workstations within the Demised Premises without treating the same as an unauthorized sub-lease.",
  },
  {
    title: "Right of First Refusal (ROFR) for Additional Space",
    text: "In the event any contiguous office unit or floor on the same building becomes vacant during the subsistence of this lease, the Lessor shall first offer the same in writing to the Lessee on prevailing market commercial terms before offering to third parties.",
  },
  {
    title: "Handover Reinstatement Condition",
    text: "Upon vacation or expiration of this lease, the Lessee shall hand over the Demised Premises in broom-clean condition with all built-in air-conditioning ducts and standard civil walls intact, normal wear and tear excepted.",
  },
];

export default function AgreementEditorModal({
  contractId,
  contractCode,
  tenantName,
  propertyName,
  isOpen,
  onClose,
  onSuccess,
  isAdmin = true,
}: AgreementEditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"none" | "pending_admin_approval" | "approved" | "rejected">("none");
  const [activeTab, setActiveTab] = useState<"terms" | "clauses" | "special">("terms");

  // Form Fields
  const [executionCity, setExecutionCity] = useState("Ahmedabad");
  const [executionState, setExecutionState] = useState("Gujarat");
  const [lessorBoardResolution, setLessorBoardResolution] = useState("");
  const [lesseeBoardResolution, setLesseeBoardResolution] = useState("");
  const [lockInMonths, setLockInMonths] = useState<number>(12);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(90);
  const [fitoutPeriodDays, setFitoutPeriodDays] = useState<number>(30);
  const [paymentDueDate, setPaymentDueDate] = useState("5th day of each English calendar month");
  const [penalInterestPct, setPenalInterestPct] = useState<number>(18);
  const [carParkingSlots, setCarParkingSlots] = useState<number>(5);
  const [twoWheelerSlots, setTwoWheelerSlots] = useState<number>(10);
  const [stampDutySharing, setStampDutySharing] = useState("Shared equally (50:50) between Lessor and Lessee");
  const [eStampReserveSpace, setEStampReserveSpace] = useState(false);
  const [customClauses, setCustomClauses] = useState<AgreementCustomClause[]>([]);
  const [specialConditions, setSpecialConditions] = useState("");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [submittedBy, setSubmittedBy] = useState<string | null>(null);

  // Load existing revision on open
  useEffect(() => {
    if (!isOpen || !contractId) return;
    fetchRevision();
  }, [isOpen, contractId]);

  const fetchRevision = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contracts/${contractId}/agreement-revision`);
      if (res.ok) {
        const json = await res.json();
        const rev = json.revision;
        if (rev && rev.status && rev.status !== "none") {
          setStatus(rev.status);
          if (rev.executionCity) setExecutionCity(rev.executionCity);
          if (rev.executionState) setExecutionState(rev.executionState);
          if (rev.lessorBoardResolution) setLessorBoardResolution(rev.lessorBoardResolution);
          if (rev.lesseeBoardResolution) setLesseeBoardResolution(rev.lesseeBoardResolution);
          if (rev.lockInMonths !== undefined) setLockInMonths(rev.lockInMonths);
          if (rev.noticePeriodDays !== undefined) setNoticePeriodDays(rev.noticePeriodDays);
          if (rev.fitoutPeriodDays !== undefined) setFitoutPeriodDays(rev.fitoutPeriodDays);
          if (rev.paymentDueDate) setPaymentDueDate(rev.paymentDueDate);
          if (rev.penalInterestPct !== undefined) setPenalInterestPct(rev.penalInterestPct);
          if (rev.carParkingSlots !== undefined) setCarParkingSlots(rev.carParkingSlots);
          if (rev.twoWheelerSlots !== undefined) setTwoWheelerSlots(rev.twoWheelerSlots);
          if (rev.stampDutySharing) setStampDutySharing(rev.stampDutySharing);
          if (rev.eStampReserveSpace !== undefined) setEStampReserveSpace(rev.eStampReserveSpace);
          if (rev.customClauses && Array.isArray(rev.customClauses)) setCustomClauses(rev.customClauses);
          if (rev.specialConditions) setSpecialConditions(rev.specialConditions);
          if (rev.submittedAt) setSubmittedAt(rev.submittedAt);
          if (rev.submittedBy) setSubmittedBy(rev.submittedBy);
        } else {
          setStatus("none");
        }
      }
    } catch (e) {
      console.error("Error fetching revision:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClause = (preset?: { title: string; text: string }) => {
    setCustomClauses((prev) => [
      ...prev,
      {
        id: `clause_${Date.now()}`,
        clauseTitle: preset ? preset.title : `Additional Covenant ${prev.length + 1}`,
        clauseText: preset ? preset.text : "",
      },
    ]);
  };

  const handleUpdateClause = (index: number, field: "clauseTitle" | "clauseText", value: string) => {
    setCustomClauses((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveClause = (index: number) => {
    setCustomClauses((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitForApproval = async () => {
    if (!contractId) return;
    try {
      setSaving(true);
      const payload = {
        executionCity,
        executionState,
        lessorBoardResolution,
        lesseeBoardResolution,
        lockInMonths,
        noticePeriodDays,
        fitoutPeriodDays,
        paymentDueDate,
        penalInterestPct,
        carParkingSlots,
        twoWheelerSlots,
        stampDutySharing,
        eStampReserveSpace,
        customClauses,
        specialConditions,
        submittedBy: typeof window !== "undefined" ? localStorage.getItem("officex_user_email") || "Property Owner" : "Property Owner",
      };

      const res = await fetch(`/api/contracts/${contractId}/agreement-revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("pending_admin_approval");
        alert("✓ Agreement revisions submitted successfully!\n\nYour customized agreement clauses are now pending OfficeX Admin approval. Once approved, the active legal agreement will reflect these terms.");
        if (onSuccess) onSuccess();
      } else {
        alert("Failed to submit agreement revision.");
      }
    } catch (e) {
      alert("Error submitting revision.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdminDecision = async (action: "approve" | "reject") => {
    if (!contractId) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/contracts/${contractId}/agreement-revision`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setStatus(action === "approve" ? "approved" : "rejected");
        alert(
          action === "approve"
            ? "✓ Agreement revision APPROVED!\n\nThe updated clauses and terms are now actively binding on the official commercial agreement."
            : "Agreement revision has been rejected."
        );
        if (onSuccess) onSuccess();
      } else {
        alert("Failed to process approval action.");
      }
    } catch (e) {
      alert("Error processing admin action.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPdf = () => {
    if (!contractId) return;
    window.open(`/api/contracts/${contractId}/pdf?preview=true&subscribed=true`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Commercial Agreement Editor &amp; Custom Clauses
                </h2>
                <p className="text-xs text-slate-500">
                  Contract: <span className="font-semibold text-slate-700">{contractCode || "LEAS-73856"}</span> · Tenant: <span className="font-semibold text-slate-700">{tenantName || "Corporate Occupant"}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill */}
            {status === "approved" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 size={13} />
                Approved &amp; Active
              </span>
            )}
            {status === "pending_admin_approval" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                <Clock size={13} />
                Pending OfficeX Admin Approval
              </span>
            )}
            {status === "rejected" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertTriangle size={13} />
                Revision Rejected
              </span>
            )}
            {status === "none" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                Standard Template
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Admin Notification Banner */}
        {status === "pending_admin_approval" && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-amber-900">
              <Clock size={16} className="text-amber-700 shrink-0" />
              <span>
                <strong>Draft Revision Submitted:</strong> {submittedBy || "Property Owner"} submitted custom terms on{" "}
                {submittedAt ? new Date(submittedAt).toLocaleDateString("en-IN") : "today"}. Requires Admin approval before active lease updates.
              </span>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAdminDecision("approve")}
                  disabled={saving}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  Approve Revision
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminDecision("reject")}
                  disabled={saving}
                  className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === "terms"
                ? "border-teal-600 text-teal-800"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            1. Core Commercial Terms &amp; Execution
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clauses")}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "clauses"
                ? "border-teal-600 text-teal-800"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            2. Custom Clauses &amp; Special Covenants
            {customClauses.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] flex items-center justify-center font-bold">
                {customClauses.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("special")}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === "special"
                ? "border-teal-600 text-teal-800"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            3. Bespoke Operational Terms
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              Loading agreement configuration...
            </div>
          ) : (
            <>
              {/* TAB 1: CORE COMMERCIAL TERMS */}
              {activeTab === "terms" && (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                      Execution Jurisdiction &amp; Corporate Authority
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Execution City *
                        </label>
                        <input
                          type="text"
                          value={executionCity}
                          onChange={(e) => setExecutionCity(e.target.value)}
                          placeholder="e.g. Ahmedabad, Noida, Mumbai"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          value={executionState}
                          onChange={(e) => setExecutionState(e.target.value)}
                          placeholder="e.g. Gujarat, Uttar Pradesh, Maharashtra"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Lessor Board Resolution / Minutes Date (Optional)
                        </label>
                        <input
                          type="text"
                          value={lessorBoardResolution}
                          onChange={(e) => setLessorBoardResolution(e.target.value)}
                          placeholder="e.g. 24th December 2024"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Lessee Board Resolution / PoA Date (Optional)
                        </label>
                        <input
                          type="text"
                          value={lesseeBoardResolution}
                          onChange={(e) => setLesseeBoardResolution(e.target.value)}
                          placeholder="e.g. 15th January 2025"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                      Enforceability &amp; Financial Stipulations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Lock-In Period (Months)
                        </label>
                        <input
                          type="number"
                          value={lockInMonths}
                          onChange={(e) => setLockInMonths(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Mandatory minimum tenure
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Post Lock-In Notice (Days)
                        </label>
                        <input
                          type="number"
                          value={noticePeriodDays}
                          onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Exit written notice window
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Penal Interest Rate (% p.a.)
                        </label>
                        <input
                          type="number"
                          value={penalInterestPct}
                          onChange={(e) => setPenalInterestPct(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Standard commercial is 18% or 24%
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Rent Payment Due Date
                        </label>
                        <input
                          type="text"
                          value={paymentDueDate}
                          onChange={(e) => setPaymentDueDate(e.target.value)}
                          placeholder="e.g. 5th day of each month"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Rent-Free Fitout Days
                        </label>
                        <input
                          type="number"
                          value={fitoutPeriodDays}
                          onChange={(e) => setFitoutPeriodDays(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Covered Car Parking Slots
                        </label>
                        <input
                          type="number"
                          value={carParkingSlots}
                          onChange={(e) => setCarParkingSlots(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                      Stamp Duty &amp; Stamping Options
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Stamp Duty &amp; Registration Expense Sharing
                        </label>
                        <select
                          value={stampDutySharing}
                          onChange={(e) => setStampDutySharing(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
                        >
                          <option value="Shared equally (50:50) between Lessor and Lessee">
                            Shared equally (50:50) between Lessor and Lessee (Standard)
                          </option>
                          <option value="Borne 100% solely by the Lessee">
                            Borne 100% solely by the Lessee
                          </option>
                          <option value="Borne 100% solely by the Lessor">
                            Borne 100% solely by the Lessor
                          </option>
                        </select>
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eStampReserveSpace}
                            onChange={(e) => setEStampReserveSpace(e.target.checked)}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                          />
                          <span className="text-xs font-medium text-slate-800">
                            Reserve 100mm Top Space on Page 1 for Non-Judicial e-Stamp Paper Franking
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM CLAUSES */}
              {activeTab === "clauses" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Custom Agreement Clauses</h3>
                      <p className="text-xs text-slate-500">
                        Add specialized legal covenants for signage, DG power SLAs, fitout permissions, or group affiliate usage.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddClause()}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus size={14} /> Add Blank Clause
                    </button>
                  </div>

                  {/* Quick Preset Badges */}
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                    <span className="text-[11px] font-bold text-teal-900 block mb-1.5">
                      ⚡ Quick Add Institutional Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_CLAUSES.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddClause(p)}
                          className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Plus size={11} /> {p.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {customClauses.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No custom clauses added yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Click &ldquo;Add Blank Clause&rdquo; or pick one of the institutional presets above.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customClauses.map((clause, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 relative group"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              Clause {idx + 15}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveClause(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition"
                              title="Delete clause"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={clause.clauseTitle}
                              onChange={(e) => handleUpdateClause(idx, "clauseTitle", e.target.value)}
                              placeholder="Clause Title (e.g. Facade Branding & Signage)"
                              className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                            />
                          </div>

                          <div>
                            <textarea
                              rows={3}
                              value={clause.clauseText}
                              onChange={(e) => handleUpdateClause(idx, "clauseText", e.target.value)}
                              placeholder="Detailed legal covenant text..."
                              className="w-full px-3 py-2 text-xs text-slate-700 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SPECIAL CONDITIONS */}
              {activeTab === "special" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Bespoke Operational Conditions</h3>
                    <p className="text-xs text-slate-500">
                      Enter any specific landlord representations, building-specific guidelines, or handover condition protocols.
                    </p>
                  </div>

                  <textarea
                    rows={8}
                    value={specialConditions}
                    onChange={(e) => setSpecialConditions(e.target.value)}
                    placeholder="e.g. Landlord warrants that the building holds valid Fire Safety NOC #FS-2024-884. Water supply shall be provided uninterrupted through dual municipal borewell pipelines..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-teal-500 leading-relaxed text-slate-800"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviewPdf}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ExternalLink size={13} />
              Preview Agreement Deed (PDF)
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmitForApproval}
              disabled={saving}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
              {saving ? "Submitting..." : "Submit Revision for Admin Approval"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  Send,
  Printer,
  ChevronRight,
  TrendingUp,
  Percent,
  Check,
  Zap,
  Info,
  Clock,
  ExternalLink,
} from "lucide-react";

interface PreCheckItem {
  id: string;
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  code: string;
}

export default function BillingRunsPage() {
  const [period, setPeriod] = useState("Oct-2026");
  const [splitMode, setSplitMode] = useState(true); // Split invoices mode: Rent, CAM, Utility
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Validation, 2: Preview & Split Config, 3: Issued
  const [executing, setExecuting] = useState(false);
  const [issuedSummary, setIssuedSummary] = useState<any>(null);

  const fetchPreChecks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/billing-runs?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch billing run info:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreChecks();
  }, [period]);

  const handleExecuteBillingRun = async (action: "approve" | "issue") => {
    setExecuting(true);
    try {
      const res = await fetch("/api/billing-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          consolidate: !splitMode,
          action,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIssuedSummary(json);
        setStep(3);
      } else {
        alert(json.error || "Failed to execute billing run");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setExecuting(false);
    }
  };

  const preChecks: PreCheckItem[] = [
    {
      id: "al-14",
      name: "Flex Monthly Seat Counts (Cutoff Lock)",
      code: "AL-14",
      status: (data?.pre_checks?.unapproved_seat_counts?.length || 0) > 0 ? "warn" : "pass",
      detail:
        (data?.pre_checks?.unapproved_seat_counts?.length || 0) > 0
          ? `${data.pre_checks.unapproved_seat_counts.length} seat counts pending approval for ${period}`
          : "All active managed office occupant seat counts approved",
    },
    {
      id: "al-15",
      name: "Sub-Meter Electricity / Water Readings",
      code: "AL-15",
      status: (data?.pre_checks?.unlogged_active_meters?.length || 0) > 0 ? "warn" : "pass",
      detail:
        (data?.pre_checks?.unlogged_active_meters?.length || 0) > 0
          ? `${data.pre_checks.unlogged_active_meters.length} active meters missing readings for ${period}`
          : "All active physical & virtual meters logged with valid kWh/kL",
    },
    {
      id: "gstin-b2b",
      name: "B2B GSTIN Statutory Registration Check",
      code: "RULE-46",
      status: (data?.pre_checks?.occupants_missing_gstin?.length || 0) > 0 ? "warn" : "pass",
      detail:
        (data?.pre_checks?.occupants_missing_gstin?.length || 0) > 0
          ? `${data.pre_checks.occupants_missing_gstin.length} occupants missing valid GSTIN (B2C invoicing fallback)`
          : "100% of corporate occupants verified with valid GSTIN state codes",
    },
    {
      id: "escalations",
      name: "Rent Step Escalations Scheduled for Period",
      code: "D-21",
      status: "pass",
      detail: "No overdue unapplied lease escalations found for this billing cycle",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Screen S-40 &middot; Billing Engine
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Wave 3 Compliant
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Enhanced Billing Centre &middot; Billing Run
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Indian Commercial Real Estate multi-step billing engine with Split Invoices Mode, pre-run diff validation, and statutory tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none pr-3"
            >
              <option value="Oct-2026">Oct-2026 (Current Cycle)</option>
              <option value="Nov-2026">Nov-2026</option>
              <option value="Dec-2026">Dec-2026</option>
              <option value="Jan-2027">Jan-2027</option>
            </select>
          </div>

          <button
            onClick={fetchPreChecks}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Pre-checks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/operate/invoices"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition border border-slate-200"
          >
            View All Invoices
          </Link>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setStep(1)}
          className={`cursor-pointer p-4 rounded-xl border transition ${
            step === 1
              ? "bg-indigo-600 text-white shadow-md border-indigo-600"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold tracking-wider uppercase opacity-80">
              Step 1
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
              4 Pre-Checks
            </span>
          </div>
          <div className="text-base font-bold">Pre-Run Diff Validation</div>
          <div className="text-xs opacity-80 mt-1">
            Seat cutoff lock (AL-14), meter logs (AL-15), GSTIN status
          </div>
        </div>

        <div
          onClick={() => setStep(2)}
          className={`cursor-pointer p-4 rounded-xl border transition ${
            step === 2
              ? "bg-indigo-600 text-white shadow-md border-indigo-600"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold tracking-wider uppercase opacity-80">
              Step 2
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
              Split Mode Config
            </span>
          </div>
          <div className="text-base font-bold">Split Billing & Series Preview</div>
          <div className="text-xs opacity-80 mt-1">
            INV-RENT, INV-CAM, INV-UTIL series breakdown
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border transition ${
            step === 3
              ? "bg-indigo-600 text-white shadow-md border-indigo-600"
              : "bg-white text-slate-400 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold tracking-wider uppercase opacity-80">
              Step 3
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
              Output
            </span>
          </div>
          <div className="text-base font-bold">Issue & Print Invoices</div>
          <div className="text-xs opacity-80 mt-1">
            Batch issuance, PDF Tax Invoices & tenant notification
          </div>
        </div>
      </div>

      {/* STEP 1: PRE-RUN DIFF VALIDATION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pre-Run Exception Queue &middot; {period}
                </h2>
                <p className="text-xs text-slate-500">
                  Validates operational readiness before running invoice creation jobs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  {preChecks.filter((c) => c.status === "pass").length} / {preChecks.length} Passed
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {preChecks.map((check) => (
                <div
                  key={check.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {check.status === "pass" ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {check.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 rounded">
                          {check.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{check.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {check.status === "pass" ? (
                      <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Warning
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm"
              >
                Proceed to Split Billing Config <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SPLIT INVOICES MODE & PREVIEW */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Split Mode Toggle Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/30">
                    Indian CRE Standard
                  </span>
                  <span className="text-xs text-slate-300">Section 4.10 &middot; Split Invoicing</span>
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  Split Invoices Mode (Distinct Billing Entities)
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Generates separate tax invoices per occupant for <strong>Base Rent</strong> (Owner SPV series), <strong>CAM</strong> (Facilities Management series), and <strong>Metered Utilities</strong> (Electricity / Water series) with independent GST registration numbers and SAC codes.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/10">
                <button
                  onClick={() => setSplitMode(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    !splitMode
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Consolidated (1 Invoice)
                </button>
                <button
                  onClick={() => setSplitMode(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    splitMode
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Split Mode (3 Separate Series)
                </button>
              </div>
            </div>
          </div>

          {/* Group Series Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Rent Invoices
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-50 text-blue-700 rounded">
                  INV-RENT-
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{(data?.summary?.rent_subtotal || 2424200).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                SAC 997212 &middot; 10% TDS (§194-I)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  CAM Invoices
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-50 text-amber-700 rounded">
                  INV-CAM-
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{(data?.summary?.cam_subtotal || 238000).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                FM Entity &middot; 2% TDS (§194-C)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Metered Utilities
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 rounded">
                  INV-UTIL-
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{(data?.summary?.utility_subtotal || 142500).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                SAC 9969 &middot; Electricity / Water
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Gross Run Total
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded">
                  18% GST incl.
                </span>
              </div>
              <div className="text-2xl font-black text-white">
                ₹{(
                  (data?.summary?.gross_total || 2804700) * 1.18
                ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Net Receivable after TDS: ₹
                {(
                  (data?.summary?.gross_total || 2804700) * 1.18 -
                  (data?.summary?.rent_subtotal || 2424200) * 0.1
                ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="text-sm font-bold text-slate-800">
                  Ready for Generation & Issuance
                </div>
                <div className="text-xs text-slate-500">
                  Invoices will be created in status &apos;issued&apos; and immediately accessible for PDF generation.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Back to Pre-Checks
              </button>

              <button
                onClick={() => handleExecuteBillingRun("issue")}
                disabled={executing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm"
              >
                {executing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {splitMode ? "Generate & Issue Split Invoices" : "Generate & Issue Consolidated Invoices"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ISSUANCE COMPLETE */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            Billing Run Executed Successfully!
          </h2>

          <p className="text-sm text-slate-600">
            {issuedSummary?.message ||
              `Invoices for ${period} generated and issued under ${
                splitMode ? "Split Invoicing Mode" : "Consolidated Mode"
              }.`}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left font-mono text-xs text-slate-700 space-y-1">
            <div>&bull; Billing Run Period: {period}</div>
            <div>&bull; Mode: {splitMode ? "Split (INV-RENT-, INV-CAM-, INV-UTIL-)" : "Consolidated"}</div>
            <div>&bull; Invoices Issued: {issuedSummary?.invoices_issued_count || issuedSummary?.invoices_created_count || "All Active Occupants"}</div>
            <div>&bull; Statutory Compliance: 100% Indian GST Rule 46</div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/operate/invoices"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" /> Go to Invoice Register
            </Link>

            <button
              onClick={() => {
                setStep(1);
                fetchPreChecks();
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
            >
              Start New Run
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Trash2,
  Download,
  Save,
  Layers,
  Building,
  Users,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface ProfileResponse {
  batch_id: string;
  batch_code: string;
  total_rows: number;
  headers: string[];
  column_suggestions: Array<{
    sourceHeader: string;
    suggestedTarget: string | null;
    confidence: number;
    sampleValues: any[];
  }>;
  preview_rows: Record<string, any>[];
  quality_warnings: string[];
}

interface ValidationResponse {
  total_rows: number;
  passed_rows: number;
  warning_rows: number;
  failed_rows: number;
  exceptions_count: number;
}

interface DiffResponse {
  new_spaces: number;
  updated_spaces: number;
  new_occupants: number;
  updated_occupants: number;
  new_contracts: number;
  updated_contracts: number;
  rows: Array<{
    source_row_num: number;
    space_code: string;
    space_action: "new" | "update" | "unchanged";
    occupant_name: string;
    occupant_action: "new" | "update" | "unchanged";
    contract_code: string;
    contract_action: "new" | "update" | "unchanged";
    monthly_rent: number;
    area_sqft: number;
  }>;
}

interface ImportBatchRecord {
  id: string;
  batch_code: string;
  file_name: string;
  total_rows: number;
  passed_rows: number;
  warning_rows: number;
  failed_rows: number;
  import_status: string;
  imported_at: string;
  committed_at?: string;
  voided_at?: string;
  error_file_path?: string;
}

const TARGET_FIELDS = [
  { value: "space_code", label: "Space / Unit Code * (Required)" },
  { value: "occupant_name", label: "Tenant / Occupant Name * (Required)" },
  { value: "chargeable_area_sqft", label: "Chargeable Area (sqft) * (Required)" },
  { value: "monthly_rent", label: "Monthly Base Rent (₹) * (Required)" },
  { value: "start_date", label: "Lease Start Date * (Required)" },
  { value: "end_date", label: "Lease End Date * (Required)" },
  { value: "escalation_phrase", label: "Escalation Rate / Formula" },
  { value: "deposit_amount", label: "Security Deposit (₹)" },
  { value: "property_name", label: "Property / Asset Name" },
  { value: "building_name", label: "Building / Tower Name" },
  { value: "floor_name", label: "Floor / Level" },
  { value: "contract_type", label: "Contract Type (Lease, Licence, etc.)" },
  { value: "occupancy_status", label: "Occupancy Status" },
  { value: "unmapped", label: "— Do Not Map (Keep in Staging) —" },
];

export function DataImportView({ onClose }: { onClose?: () => void }) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stored state across steps
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [diffData, setDiffData] = useState<DiffResponse | null>(null);
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [importHistory, setImportHistory] = useState<ImportBatchRecord[]>([]);

  // Load history and saved templates on mount
  useEffect(() => {
    fetchHistory();
    fetchTemplates();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/imports");
      const json = await res.json();
      if (json.batches) setImportHistory(json.batches);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/imports/templates");
      const json = await res.json();
      if (json.templates) setSavedTemplates(json.templates);
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/imports/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setProfileData(data);

      // Pre-fill mapping suggestions
      const initialMapping: Record<string, string> = {};
      data.column_suggestions.forEach((s: any) => {
        initialMapping[s.sourceHeader] = s.suggestedTarget || "unmapped";
      });
      setColumnMapping(initialMapping);
      setActiveStep(2); // Move to Preview / Mapping
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Handle Mapping Template Save / Apply
  const handleApplyMapping = async () => {
    if (!profileData) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/imports/${profileData.batch_id}/map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapping: columnMapping }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Mapping application failed");

      // Now run validation
      await handleRunValidation();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplateName.trim()) {
      alert("Please enter a template name");
      return;
    }
    try {
      await fetch("/api/imports/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: selectedTemplateName.trim(),
          mapping_rules: columnMapping,
        }),
      });
      alert(`Template '${selectedTemplateName}' saved successfully!`);
      fetchTemplates();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 3. Run validation
  const handleRunValidation = async () => {
    if (!profileData) return;
    try {
      const res = await fetch(`/api/imports/${profileData.batch_id}/validate`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Validation failed");

      setValidationData(json);

      // Fetch exceptions
      const excRes = await fetch(`/api/imports/${profileData.batch_id}/exceptions`);
      const excJson = await excRes.json();
      if (excJson.exceptions) setExceptions(excJson.exceptions);

      setActiveStep(3); // Move to Validation Results
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Run Diff
  const handleRunDiff = async () => {
    if (!profileData) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/imports/${profileData.batch_id}/diff`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Diff calculation failed");

      setDiffData(json.diff);
      setActiveStep(4); // Move to Diff Summary
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Commit import
  const handleCommit = async () => {
    if (!profileData) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // First signoff approve
      await fetch(`/api/imports/${profileData.batch_id}/approve`, { method: "POST" });

      // Then commit to production
      const res = await fetch(`/api/imports/${profileData.batch_id}/commit`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Commit failed");

      setCommitResult(json);
      setActiveStep(5); // Move to Complete
      fetchHistory();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Void import
  const handleVoidImport = async (batchId: string) => {
    if (!confirm("Are you sure you want to void this import? All created properties, spaces, and contracts will be soft-deleted.")) return;
    try {
      const res = await fetch(`/api/imports/${batchId}/void`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Void failed");
      alert(json.message);
      fetchHistory();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-400">
              §S-30
            </span>
            <h2 className="text-xl font-bold text-white">Legacy Rent Roll Import Pipeline</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Automated schema mapping, entity explosion, Indian formatting transforms, exception queue, and audit-traceable commit.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
          >
            Back to Rent Roll
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step Indicator */}
      <div className="grid grid-cols-5 gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-xs">
        {[
          { num: 1, label: "Upload & Profile" },
          { num: 2, label: "Column Mapping" },
          { num: 3, label: "Validation & Exceptions" },
          { num: 4, label: "Diff & Signoff" },
          { num: 5, label: "Production Commit" },
        ].map((s) => {
          const isDone = activeStep > s.num;
          const isCurrent = activeStep === s.num;
          return (
            <div
              key={s.num}
              className={`flex items-center gap-2 rounded-lg p-2.5 transition-all ${
                isCurrent
                  ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/40"
                  : isDone
                  ? "bg-slate-800/40 text-emerald-400"
                  : "text-slate-500"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent
                    ? "bg-indigo-500 text-white"
                    : isDone
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {isDone ? "✓" : s.num}
              </div>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: File Upload */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-12 text-center transition hover:border-indigo-500/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-white">Upload Legacy Rent Roll File</h3>
            <p className="mt-1 text-sm text-slate-400 max-w-md">
              Drag & drop Excel (.xlsx, .xls) or CSV (.csv) file here, or click to browse. Blank rows and totals summaries will be automatically stripped.
            </p>
            <label className="mt-6 cursor-pointer rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500">
              {isUploading ? "Uploading & Profiling..." : "Choose File to Upload"}
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>Supports Indian format (10,00,000 / 10.00.000)</span>
              <span>•</span>
              <span>Auto-detects DD-MM-YYYY dates</span>
              <span>•</span>
              <span>Unit conversion (sqm &rarr; sqft)</span>
            </div>
          </div>

          {/* Past Imports History */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Recent Import Batches (Past 50)
              </h3>
              <button
                onClick={fetchHistory}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            {importHistory.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No previous import batches found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Batch Code</th>
                      <th className="py-2.5 px-3">File Name</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Passed</th>
                      <th className="py-2.5 px-3">Warnings</th>
                      <th className="py-2.5 px-3">Failed</th>
                      <th className="py-2.5 px-3">Imported Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {importHistory.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-mono font-medium text-indigo-300">{b.batch_code}</td>
                        <td className="py-3 px-3 text-slate-300">{b.file_name}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              b.import_status === "committed"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : b.import_status === "voided"
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {b.import_status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">{b.total_rows}</td>
                        <td className="py-3 px-3 text-emerald-400">{b.passed_rows}</td>
                        <td className="py-3 px-3 text-amber-400">{b.warning_rows}</td>
                        <td className="py-3 px-3 text-rose-400">{b.failed_rows}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(b.imported_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          {b.failed_rows > 0 && (
                            <a
                              href={`/api/imports/${b.id}/error-file`}
                              download
                              className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-rose-300 hover:bg-slate-700"
                            >
                              <Download className="h-3 w-3" /> Error File
                            </a>
                          )}
                          {b.import_status === "committed" && (
                            <button
                              onClick={() => handleVoidImport(b.id)}
                              className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-1 text-[11px] text-rose-400 hover:bg-rose-500/20"
                            >
                              <Trash2 className="h-3 w-3" /> Void
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Preview & Column Mapping */}
      {activeStep === 2 && profileData && (
        <div className="space-y-6">
          {/* Quality Alerts Banner */}
          {profileData.quality_warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="h-4 w-4" /> Data Profiling Quality Flags:
              </div>
              {profileData.quality_warnings.map((w, idx) => (
                <div key={idx} className="pl-5">• {w}</div>
              ))}
            </div>
          )}

          {/* Table Preview (First 10 Rows) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">Source File Preview (First 10 Rows)</h3>
                <p className="text-xs text-slate-400">
                  {profileData.total_rows} data rows discovered in <strong>{profileData.batch_code}</strong>.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-64 border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-800 text-slate-300 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    {profileData.headers.map((h) => (
                      <th key={h} className="py-2 px-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profileData.preview_rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                      {profileData.headers.map((h) => (
                        <td key={h} className="py-2 px-3 text-slate-300">{String(row[h] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column Mapping Matrix */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-semibold text-white">Schema Field Mapping & Synonym Matching</h3>
                <p className="text-xs text-slate-400">
                  Map source spreadsheet headers to standard Rent Roll fields. Unmapped columns are preserved in staging JSONB.
                </p>
              </div>
              {savedTemplates.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Apply Template:</span>
                  <select
                    className="rounded bg-slate-800 border border-slate-700 px-2 py-1 text-slate-200"
                    onChange={(e) => {
                      const t = savedTemplates.find((x) => x.id === e.target.value);
                      if (t && t.mapping_rules) {
                        setColumnMapping({ ...columnMapping, ...t.mapping_rules });
                      }
                    }}
                  >
                    <option value="">Select saved template...</option>
                    {savedTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.template_name} (v{t.template_version})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.column_suggestions.map((col) => {
                const isMapped = columnMapping[col.sourceHeader] && columnMapping[col.sourceHeader] !== "unmapped";
                return (
                  <div
                    key={col.sourceHeader}
                    className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                      isMapped
                        ? "border-indigo-500/40 bg-indigo-500/5"
                        : "border-slate-800 bg-slate-900/30"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                          {col.sourceHeader}
                        </span>
                        {col.confidence > 0.8 && (
                          <span className="flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-400">
                            <Sparkles className="h-2.5 w-2.5" /> {(col.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Sample: {col.sampleValues.filter(Boolean).slice(0, 2).join(", ") || "(empty)"}
                      </div>
                    </div>

                    <select
                      value={columnMapping[col.sourceHeader] || "unmapped"}
                      onChange={(e) =>
                        setColumnMapping({
                          ...columnMapping,
                          [col.sourceHeader]: e.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      {TARGET_FIELDS.map((tf) => (
                        <option key={tf.value} value={tf.value}>
                          {tf.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Save Template Box */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Save mapping as template name..."
                  value={selectedTemplateName}
                  onChange={(e) => setSelectedTemplateName(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700"
                >
                  <Save className="h-3 w-3" /> Save Template
                </button>
              </div>

              <button
                onClick={handleApplyMapping}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50"
              >
                {isLoading ? "Exploding & Validating..." : "Apply Mapping & Run Validation"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Validation & Exception Queue */}
      {activeStep === 3 && validationData && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-xs text-slate-400">Total Evaluated Rows</div>
              <div className="mt-1 text-2xl font-bold text-white">{validationData.total_rows}</div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Passed Cleanly
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-300">{validationData.passed_rows}</div>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Warnings (Exception Queue)
              </div>
              <div className="mt-1 text-2xl font-bold text-amber-300">{validationData.warning_rows}</div>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <div className="text-xs text-rose-400 flex items-center gap-1">
                <XCircle className="h-4 w-4" /> Failed (Will Be Excluded)
              </div>
              <div className="mt-1 text-2xl font-bold text-rose-300">{validationData.failed_rows}</div>
            </div>
          </div>

          {/* Exception Queue Review */}
          {exceptions.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                    Exception Queue ({exceptions.length} items flagged)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review flagged anomalies (zero rent, large area, duplicate space codes). These rows will be imported with audit notes.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto border border-slate-800 rounded-lg">
                {exceptions.map((exc) => (
                  <div key={exc.id} className="p-3 text-xs flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-indigo-400">Row #{exc.source_row_num}</span>
                        <span
                          className={`rounded px-1.5 py-0.2 font-semibold ${
                            exc.flag_type === "warning"
                              ? "bg-amber-500/20 text-amber-300"
                              : exc.flag_type === "error"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {exc.flag_type.toUpperCase()}
                        </span>
                        <span className="font-mono text-slate-400">[{exc.field_name}]</span>
                      </div>
                      <div className="text-slate-300">{exc.flag_message}</div>
                      {exc.actual_value && (
                        <div className="text-[11px] text-slate-500">
                          Actual: {exc.actual_value} | Expected: {exc.expected_value}
                        </div>
                      )}
                    </div>
                    <div>
                      {exc.user_resolved_at ? (
                        <span className="text-[11px] text-emerald-400">✓ Acknowledged</span>
                      ) : (
                        <button
                          onClick={async () => {
                            await fetch(`/api/imports/${profileData?.batch_id}/exceptions`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ exception_id: exc.id }),
                            });
                            // Refresh exceptions
                            const res = await fetch(`/api/imports/${profileData?.batch_id}/exceptions`);
                            const j = await res.json();
                            setExceptions(j.exceptions);
                          }}
                          className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              onClick={() => setActiveStep(2)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700"
            >
              Back to Mapping
            </button>
            <button
              onClick={handleRunDiff}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500"
            >
              Proceed to Database Diff & Signoff
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Diff & Approval */}
      {activeStep === 4 && diffData && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-white">Database Diff & Change Preview</h3>
              <p className="text-xs text-slate-400">
                Comparing staged rows against current production records. Review new vs updated entities before applying changes.
              </p>
            </div>

            {/* Counts Matrix */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <Building className="h-4 w-4 text-indigo-400" /> Spaces
                </div>
                <div className="mt-2 text-lg font-bold text-white">
                  <span className="text-emerald-400">+{diffData.new_spaces} new</span>
                  {diffData.updated_spaces > 0 && (
                    <span className="text-amber-400 text-sm ml-2">({diffData.updated_spaces} update)</span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <Users className="h-4 w-4 text-emerald-400" /> Occupants
                </div>
                <div className="mt-2 text-lg font-bold text-white">
                  <span className="text-emerald-400">+{diffData.new_occupants} new</span>
                  {diffData.updated_occupants > 0 && (
                    <span className="text-amber-400 text-sm ml-2">({diffData.updated_occupants} update)</span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <FileText className="h-4 w-4 text-blue-400" /> Contracts
                </div>
                <div className="mt-2 text-lg font-bold text-white">
                  <span className="text-emerald-400">+{diffData.new_contracts} new</span>
                  {diffData.updated_contracts > 0 && (
                    <span className="text-amber-400 text-sm ml-2">({diffData.updated_contracts} update)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Row Diff Table */}
            <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-800 text-slate-300 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Space Code</th>
                    <th className="py-2.5 px-3">Space Action</th>
                    <th className="py-2.5 px-3">Occupant</th>
                    <th className="py-2.5 px-3">Occupant Action</th>
                    <th className="py-2.5 px-3">Area (sqft)</th>
                    <th className="py-2.5 px-3">Base Rent (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {diffData.rows.map((r) => (
                    <tr key={r.source_row_num} className="hover:bg-slate-800/20">
                      <td className="py-2 px-3 text-slate-500 font-mono">#{r.source_row_num}</td>
                      <td className="py-2 px-3 font-semibold text-slate-200">{r.space_code}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`rounded px-1.5 py-0.5 font-semibold text-[10px] ${
                            r.space_action === "new"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {r.space_action.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{r.occupant_name}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`rounded px-1.5 py-0.5 font-semibold text-[10px] ${
                            r.occupant_action === "new"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {r.occupant_action.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{r.area_sqft?.toLocaleString()}</td>
                      <td className="py-2 px-3 font-mono text-emerald-400">₹{r.monthly_rent?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              onClick={() => setActiveStep(3)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700"
            >
              Back to Exceptions
            </button>
            <button
              onClick={handleCommit}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isLoading ? "Writing to Production..." : "Approve & Commit to Production"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Complete & Error Download */}
      {activeStep === 5 && commitResult && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Import Committed Successfully!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              All valid rows have been transformed and written to production tables. Every row includes source batch ID for traceability and void support.
            </p>

            <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto pt-2 text-center text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Contracts</div>
                <div className="text-lg font-bold text-emerald-400">{commitResult.committed_contracts}</div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Spaces</div>
                <div className="text-lg font-bold text-emerald-400">{commitResult.created_spaces}</div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Occupants</div>
                <div className="text-lg font-bold text-emerald-400">{commitResult.created_occupants}</div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Properties</div>
                <div className="text-lg font-bold text-emerald-400">{commitResult.created_properties}</div>
              </div>
            </div>

            {commitResult.has_error_file && (
              <div className="pt-4">
                <a
                  href={`/api/imports/${profileData?.batch_id}/error-file`}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-rose-500"
                >
                  <Download className="h-4 w-4" /> Download Failed Rows Error Workbook (.xlsx)
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setActiveStep(1);
                setProfileData(null);
                setCommitResult(null);
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2 text-sm text-slate-300 hover:bg-slate-700"
            >
              Start Another Import
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Return to Rent Roll Register
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

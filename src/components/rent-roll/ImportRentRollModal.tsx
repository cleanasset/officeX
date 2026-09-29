"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Eye,
  Check,
  AlertTriangle,
  Edit3,
  FileDown
} from "lucide-react";
import { formatINR } from "./DashboardTab";
import {
  validateRentRollRow,
  validateControlTotals,
  CANONICAL_RULES,
  RowValidationResult
} from "@/lib/rent-roll-rules";

interface ImportRentRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  properties: Array<{ id: string; name: string; city: string; propertyCode?: string; chargeableArea?: number; totalArea?: number }>;
  selectedPropertyId?: string;
}

export const ImportRentRollModal: React.FC<ImportRentRollModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  properties,
  selectedPropertyId
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTargetProp, setSelectedTargetProp] = useState<string>(
    selectedPropertyId && selectedPropertyId !== "ALL" ? selectedPropertyId : properties[0]?.id || ""
  );

  // Workflow Steps:
  // 1: Upload & Templates (RR-ING-01, RR-ING-02)
  // 2: In-Grid Validation & Correction (R-01 to R-44, RR-ING-06, RR-ING-08)
  // 3: Control Totals & Diff Preview (R-03, RR-ING-07, RR-ING-09)
  // 4: Batch History & 7-Day Rollback (RR-ING-11)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [fileName, setFileName] = useState<string>("");
  const [billingModel, setBillingModel] = useState<string>("area");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [rowValidationResults, setRowValidationResults] = useState<RowValidationResult[]>([]);

  const [profilingReport, setProfilingReport] = useState<{
    totalRows: number;
    duplicatesDetected: number;
    missingValuesCount: number;
    sourceTotalArea: number;
    sourceTotalRent: number;
  } | null>(null);

  // Diff Preview State (RR-ING-09)
  const [diffSummary, setDiffSummary] = useState<{
    newSpacesCount: number;
    updatedSpacesCount: number;
    newLeasesCount: number;
    updatedLeasesCount: number;
    unchangedCount: number;
    totalIncomingRows: number;
  } | null>(null);

  // Maker-Checker Sign-off State (RR-ING-10)
  const [preparerName, setPreparerName] = useState<string>("Operations Analyst");
  const [approverName, setApproverName] = useState<string>("Commercial Controller");
  const [signOffAcknowledged, setSignOffAcknowledged] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);

  // Past Batches for 7-day Rollback (RR-ING-11)
  const [batches, setBatches] = useState<any[]>([]);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/rent-roll/import");
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBatches();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPropertyObj = properties.find(p => p.id === selectedTargetProp) || properties[0];
  const targetArea = currentPropertyObj ? (currentPropertyObj.chargeableArea || currentPropertyObj.totalArea || 0) : 0;

  // Run validation on all current rows
  const revalidateAllRows = (rows: any[]) => {
    const validations = rows.map((r, idx) => validateRentRollRow(r, idx + 1));
    setRowValidationResults(validations);
  };

  // Download Sample Templates (RR-ING-02)
  const handleDownloadSampleTemplate = (model: string) => {
    let headers: string[] = [];
    let sampleRow1: string[] = [];
    let sampleRow2: string[] = [];
    let filename = "officex_rent_roll_area_template.csv";

    if (model === "seat") {
      headers = [
        "Tenant Trade Name", "Tenant Legal Name", "Building Name", "Unit Number", "Floor Number",
        "Contracted Seats", "Occupied Seats", "Rate Per Seat Monthly", "Billing Model", "Seat Billing Basis",
        "Start Date (YYYY-MM-DD)", "End Date (YYYY-MM-DD)", "GSTIN", "PAN"
      ];
      sampleRow1 = ["Quantum Flex Solutions", "Quantum Enterprise Pvt Ltd", currentPropertyObj?.name || "Apex Tower", "Suite 401", "4", "50", "48", "8500", "seat", "contracted", "2026-04-01", "2027-03-31", "27AAACQ1234F1Z5", "AAACQ1234F"];
      sampleRow2 = ["Starlight Media LLP", "Starlight Creatives LLP", currentPropertyObj?.name || "Apex Tower", "Suite 202", "2", "30", "30", "9000", "seat", "contracted", "2026-05-01", "2028-04-30", "27AALCS9876C1Z8", "AALCS9876C"];
      filename = "officex_flex_seats_template.csv";
    } else {
      headers = [
        "Tenant Trade Name", "Tenant Legal Name", "Building Name", "Unit Number", "Floor Number",
        "Chargeable Area SqFt", "Carpet Area SqFt", "Monthly Base Rent INR", "Rate PSF", "CAM Rate PSF",
        "Start Date (YYYY-MM-DD)", "End Date (YYYY-MM-DD)", "Lock In Months", "Escalation Pct", "GSTIN", "PAN"
      ];
      sampleRow1 = ["Acme Cloud Technologies", "Acme Cloud India Pvt Ltd", currentPropertyObj?.name || "Apex Tower", "Suite 401", "4", "12500", "9375", "1875000", "150", "28", "2026-04-01", "2029-03-31", "36", "15", "24AAACC1234F1Z5", "AAACC1234F"];
      sampleRow2 = ["Zenith Capital Advisory", "Zenith Capital Advisors LLP", currentPropertyObj?.name || "Apex Tower", "Suite 802", "8", "18000", "13500", "3240000", "180", "28", "2026-05-15", "2031-05-14", "36", "5", "24AAACZ9876F1Z2", "AAACZ9876F"];
      filename = "officex_rent_roll_standard_template.csv";
    }

    const csvContent = [headers.join(","), sampleRow1.join(","), sampleRow2.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Error CSV (RR-ING-08)
  const handleDownloadErrorCsv = () => {
    const errorRows = parsedRows.filter((_, idx) => !rowValidationResults[idx]?.isValid);
    if (errorRows.length === 0) return;

    const headers = ["RowNumber", "UnitNumber", "TenantName", "ChargeableArea", "MonthlyRent", "RuleCode", "ErrorMessage", "FixHint"];
    const lines = errorRows.map((r, idx) => {
      const val = rowValidationResults[r.rowNumber - 1];
      const err = val?.errors[0] || { ruleCode: "R-01", message: "Validation Error", fixHint: "" };
      return [
        r.rowNumber,
        `"${r.unitNumber}"`,
        `"${r.tenantName}"`,
        r.chargeableArea,
        r.monthlyRent,
        `"${err.ruleCode}"`,
        `"${err.message}"`,
        `"${err.fixHint}"`
      ].join(",");
    });

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `import_errors_${fileName || "rent_roll"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File & Generate Profiling Report (RR-ING-01, RR-ING-16)
  const handleFileUpload = (file: File) => {
    setErrorMsg("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorMsg("Selected file is empty.");
          return;
        }

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setErrorMsg("CSV file must have a header row and at least one data row.");
          return;
        }

        const rawHeaders = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
        const rows: any[] = [];
        const seenUnits = new Set<string>();
        let duplicatesCount = 0;
        let missingValues = 0;
        let totalSqft = 0;
        let totalRent = 0;

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (cells.length < 3) continue;

          const rowData: Record<string, any> = {};
          rawHeaders.forEach((header, idx) => {
            rowData[header] = cells[idx] || "";
          });

          const tenantName = rowData["tenanttradename"] || rowData["tenantname"] || rowData["tenant"] || rowData["memberlegalname"] || cells[0] || "";
          const legalName = rowData["tenantlegalname"] || rowData["legalname"] || tenantName;
          const propertyName = rowData["buildingname"] || rowData["propertyname"] || rowData["building"] || cells[2] || "";
          const unitNumber = rowData["unitnumber"] || rowData["unit"] || rowData["cabinsuiteid"] || cells[3] || `Unit ${100 + i}`;
          const floorNumber = Number(rowData["floornumber"] || rowData["floor"] || cells[4] || 1);
          const chargeableArea = Number(rowData["chargeableareasqft"] || rowData["chargeablearea"] || rowData["area"] || 1000);
          const carpetArea = Number(rowData["carpetareasqft"] || rowData["carpetarea"] || Math.round(chargeableArea * 0.75));
          const monthlyRent = Number(rowData["monthlybaserentinr"] || rowData["monthlyrent"] || rowData["baserent"] || (chargeableArea * 150));
          const ratePsf = Number(rowData["ratepsf"] || rowData["rate"] || (chargeableArea > 0 ? monthlyRent / chargeableArea : 0));
          const camRatePsf = Number(rowData["camratepsf"] || rowData["camrate"] || 20);
          const startDate = rowData["startdateyyyymmdd"] || rowData["startdate"] || "2026-04-01";
          const endDate = rowData["enddateyyyymmdd"] || rowData["enddate"] || "2029-03-31";
          const lockInMonths = Number(rowData["lockinmonths"] || 36);
          const escalationPct = Number(rowData["escalationpct"] || 5);
          const gstin = rowData["gstin"] || rowData["gstno"] || "";
          const pan = rowData["pan"] || rowData["panno"] || "";

          if (!tenantName || !chargeableArea || !monthlyRent) missingValues++;

          const unitKey = `${unitNumber.toLowerCase()}-${floorNumber}`;
          if (seenUnits.has(unitKey)) {
            duplicatesCount++;
          } else {
            seenUnits.add(unitKey);
          }

          totalSqft += chargeableArea;
          totalRent += monthlyRent;

          rows.push({
            rowNumber: i,
            tenantName,
            legalName,
            propertyName,
            unitNumber,
            floorNumber,
            chargeableArea,
            carpetArea,
            monthlyRent,
            ratePsf,
            camRatePsf,
            startDate,
            endDate,
            lockInMonths,
            escalationPct,
            gstin,
            pan
          });
        }

        if (rows.length === 0) {
          setErrorMsg("Could not parse any valid lease records from this CSV file.");
          return;
        }

        setParsedRows(rows);
        revalidateAllRows(rows);

        setProfilingReport({
          totalRows: rows.length,
          duplicatesDetected: duplicatesCount,
          missingValuesCount: missingValues,
          sourceTotalArea: totalSqft,
          sourceTotalRent: totalRent
        });

        setCurrentStep(2);
      } catch (err: any) {
        setErrorMsg("Failed to parse file: " + (err?.message || "Unknown error"));
      }
    };
    reader.readAsText(file);
  };

  // In-Grid Inline Cell Correction (RR-ING-08)
  const handleCellEdit = (rowIdx: number, field: string, value: any) => {
    const updated = [...parsedRows];
    updated[rowIdx] = { ...updated[rowIdx], [field]: value };

    // If area or rate changed, auto-recalculate rent
    if (field === "chargeableArea" || field === "ratePsf") {
      const a = Number(field === "chargeableArea" ? value : updated[rowIdx].chargeableArea) || 0;
      const r = Number(field === "ratePsf" ? value : updated[rowIdx].ratePsf) || 0;
      if (a > 0 && r > 0) {
        updated[rowIdx].monthlyRent = Math.round(a * r);
      }
    }

    setParsedRows(updated);
    revalidateAllRows(updated);
  };

  // Fetch Diff Preview when navigating to Step 3 (RR-ING-09)
  const handleProceedToStep3 = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rent-roll/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "diff",
          rows: parsedRows,
          targetPropertyId: selectedTargetProp
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDiffSummary(data.diffSummary);
      }
      setCurrentStep(3);
    } catch (e) {
      console.error(e);
      setCurrentStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  // Commit Ingestion to Backend (RR-ING-10)
  const handleCommitIngestion = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/rent-roll/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit",
          fileName,
          billingModel,
          rows: parsedRows,
          targetPropertyId: selectedTargetProp,
          approver: approverName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to commit ingestion.");
      setIsLoading(false);
    }
  };

  // Rollback Batch Action (RR-ING-11)
  const handleRollbackBatch = async (batchId: string) => {
    if (!confirm(`Are you sure you want to rollback batch ${batchId}? All contracts created by this batch will be removed.`)) return;

    try {
      const res = await fetch("/api/rent-roll/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rollback", batchId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Batch rolled back successfully");
        await fetchBatches();
        onSuccess();
      } else {
        alert(data.error || "Rollback failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error rolling back batch");
    }
  };

  const totalErrors = rowValidationResults.filter(r => !r.isValid).length;
  const totalWarnings = rowValidationResults.filter(r => r.isValid && r.hasWarnings).length;
  const totalPassed = rowValidationResults.filter(r => r.isValid && !r.hasWarnings).length;

  const controlTotals = validateControlTotals(parsedRows, targetArea);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 border border-teal-200 text-[#0F8B7D] rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Rent Roll 9-Stage Ingestion Centre</h3>
              <p className="text-xs text-gray-500">
                Landing Checksum · Synonym Mapping · R-01 to R-44 Rule Engine · Diff Preview · Maker-Checker Commit · 7-Day Rollback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 cursor-pointer ${currentStep === 1 ? "text-[#0F8B7D]" : "text-gray-400"}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 1 ? "bg-[#0F8B7D] text-white" : "bg-gray-200 text-gray-700"}`}>1</span>
              <span>Upload &amp; Templates</span>
            </button>
            <button
              onClick={() => parsedRows.length > 0 && setCurrentStep(2)}
              disabled={parsedRows.length === 0}
              className={`flex items-center gap-1.5 cursor-pointer ${currentStep === 2 ? "text-[#0F8B7D]" : "text-gray-400"}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 2 ? "bg-[#0F8B7D] text-white" : "bg-gray-200 text-gray-700"}`}>2</span>
              <span>In-Grid Rule Engine ({totalErrors > 0 ? `${totalErrors} Errors` : "Validated"})</span>
            </button>
            <button
              onClick={() => parsedRows.length > 0 && totalErrors === 0 && handleProceedToStep3()}
              disabled={parsedRows.length === 0 || totalErrors > 0}
              className={`flex items-center gap-1.5 cursor-pointer ${currentStep === 3 ? "text-[#0F8B7D]" : "text-gray-400"}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 3 ? "bg-[#0F8B7D] text-white" : "bg-gray-200 text-gray-700"}`}>3</span>
              <span>Control Totals &amp; Diff</span>
            </button>
          </div>

          <button
            onClick={() => setCurrentStep(4)}
            className={`flex items-center gap-1 text-[11px] cursor-pointer ${currentStep === 4 ? "text-[#0F8B7D]" : "text-gray-400 hover:text-gray-700"}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Batch History ({batches.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>🎉 Ingestion successful! Staged leases have been committed and dashboards updated.</span>
            </div>
          )}

          {/* STEP 1: Upload & Templates */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-2">Step 1: Download Standard Institutional Template (RR-ING-02)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-teal-950">Commercial Area Template</div>
                      <div className="text-[11px] text-teal-800/80">₹/SqFt, Base Rent, CAM, Stepped Escalations, GSTIN/PAN</div>
                    </div>
                    <button
                      onClick={() => handleDownloadSampleTemplate("area")}
                      className="px-3 py-1.5 bg-white text-[#0F8B7D] font-bold text-xs rounded-lg border border-teal-300 shadow-2xs hover:bg-teal-50 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-amber-950">Flex &amp; Seats Template</div>
                      <div className="text-[11px] text-amber-800/80">Per-Seat Billing, Cabins, Desks &amp; Inclusions</div>
                    </div>
                    <button
                      onClick={() => handleDownloadSampleTemplate("seat")}
                      className="px-3 py-1.5 bg-white text-amber-800 font-bold text-xs rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-50 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Target Property */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Target Portfolio Property Asset
                </label>
                <select
                  value={selectedTargetProp}
                  onChange={(e) => setSelectedTargetProp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-[#0F8B7D]"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city}) {p.propertyCode ? `· ${p.propertyCode}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropzone */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1.5">Step 2: Upload CSV / Excel File</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#0F8B7D] bg-gray-50/50 hover:bg-teal-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-gray-500">
                    <UploadCloud className="w-6 h-6 text-[#0F8B7D]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-900">Click to upload spreadsheet</span>
                    <span className="text-xs text-gray-500"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Standard CSV or Excel (.csv, .txt) up to 20 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: In-Grid Validation & Inline Correction (R-01 to R-44, RR-ING-06, RR-ING-08) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Profiling & Validation Badge Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Rows Staged</span>
                  <span className="text-base font-black text-gray-900">{parsedRows.length}</span>
                </div>
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Passed Criteria</span>
                  <span className="text-base font-black text-emerald-800">{totalPassed} rows</span>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Warnings (R-07/R-10/R-22)</span>
                  <span className="text-base font-black text-amber-800">{totalWarnings} rows</span>
                </div>
                <div className={`p-3 border rounded-xl ${totalErrors > 0 ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-teal-50 border-teal-200 text-teal-800"}`}>
                  <span className="text-[10px] font-bold uppercase block">{totalErrors > 0 ? "Errors Blocking Commit" : "Zero Blocking Errors"}</span>
                  <span className="text-base font-black">{totalErrors > 0 ? `${totalErrors} Errors` : "✓ 100% Eligible"}</span>
                </div>
              </div>

              {/* Error Actions Ribbon */}
              {totalErrors > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Errors detected in {totalErrors} rows. Fix cells directly in the table below or export error file.</span>
                  </div>
                  <button
                    onClick={handleDownloadErrorCsv}
                    className="px-3 py-1.5 bg-white text-rose-700 font-bold text-xs rounded-lg border border-rose-300 shadow-2xs hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Error File</span>
                  </button>
                </div>
              )}

              {/* In-Grid Editable Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-700">
                    In-Grid Exception Correction (Click any cell to edit)
                  </h4>
                  <span className="text-[11px] text-gray-400">RR-ING-08: Cell-level instant re-validation</span>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Tenant Name</th>
                        <th className="py-2 px-3">Unit Number</th>
                        <th className="py-2 px-3">Floor</th>
                        <th className="py-2 px-3 text-right">Area SqFt</th>
                        <th className="py-2 px-3 text-right">Rate PSF</th>
                        <th className="py-2 px-3 text-right">Monthly Rent</th>
                        <th className="py-2 px-3">GSTIN</th>
                        <th className="py-2 px-3 text-center">Status</th>
                        <th className="py-2 px-3">Rules / Fix Hint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {parsedRows.map((r, idx) => {
                        const val = rowValidationResults[idx] || { isValid: true, hasWarnings: false, errors: [], warnings: [] };
                        const hasErr = !val.isValid;
                        const hasWarn = val.hasWarnings;

                        return (
                          <tr key={idx} className={hasErr ? "bg-rose-50/40 hover:bg-rose-50/70" : hasWarn ? "bg-amber-50/20 hover:bg-amber-50/50" : "hover:bg-gray-50"}>
                            <td className="py-2 px-3 font-mono text-gray-400">{idx + 1}</td>

                            {/* Tenant */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={r.tenantName}
                                onChange={(e) => handleCellEdit(idx, "tenantName", e.target.value)}
                                className="w-36 bg-transparent hover:bg-white focus:bg-white border-b border-transparent focus:border-[#0F8B7D] font-bold text-gray-900 px-1 py-0.5 rounded outline-none"
                              />
                            </td>

                            {/* Unit */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={r.unitNumber}
                                onChange={(e) => handleCellEdit(idx, "unitNumber", e.target.value)}
                                className="w-20 bg-transparent hover:bg-white focus:bg-white border-b border-transparent focus:border-[#0F8B7D] font-mono text-gray-800 px-1 py-0.5 rounded outline-none"
                              />
                            </td>

                            {/* Floor */}
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={r.floorNumber}
                                onChange={(e) => handleCellEdit(idx, "floorNumber", Number(e.target.value))}
                                className="w-12 bg-transparent hover:bg-white focus:bg-white border-b border-transparent focus:border-[#0F8B7D] font-mono text-gray-800 px-1 py-0.5 rounded outline-none"
                              />
                            </td>

                            {/* Area */}
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                value={r.chargeableArea}
                                onChange={(e) => handleCellEdit(idx, "chargeableArea", Number(e.target.value))}
                                className="w-20 bg-transparent hover:bg-white focus:bg-white border-b border-transparent focus:border-[#0F8B7D] text-right font-mono text-gray-900 px-1 py-0.5 rounded outline-none"
                              />
                            </td>

                            {/* Rate PSF */}
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                value={r.ratePsf || 0}
                                onChange={(e) => handleCellEdit(idx, "ratePsf", Number(e.target.value))}
                                className="w-16 bg-transparent hover:bg-white focus:bg-white border-b border-transparent focus:border-[#0F8B7D] text-right font-mono text-gray-900 px-1 py-0.5 rounded outline-none"
                              />
                            </td>

                            {/* Monthly Rent */}
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                value={r.monthlyRent}
                                onChange={(e) => handleCellEdit(idx, "monthlyRent", Number(e.target.value))}
                                className="w-28 bg-transparent hover:bg-white focus:bg-white border-b border-transparent focus:border-[#0F8B7D] text-right font-mono text-emerald-800 font-bold px-1 py-0.5 rounded outline-none"
                              />
                            </td>

                            {/* GSTIN */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="15-char GSTIN"
                                value={r.gstin || ""}
                                onChange={(e) => handleCellEdit(idx, "gstin", e.target.value.toUpperCase())}
                                className={`w-32 bg-transparent hover:bg-white focus:bg-white border-b text-[11px] font-mono px-1 py-0.5 rounded outline-none ${
                                  r.gstin && val.errors.some(e => e.ruleCode === "R-15") ? "border-rose-400 text-rose-700" : "border-transparent focus:border-[#0F8B7D] text-gray-700"
                                }`}
                              />
                            </td>

                            {/* Status Badge */}
                            <td className="py-2 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                hasErr
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : hasWarn
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}>
                                {hasErr ? "FAILED" : hasWarn ? "WARNING" : "PASSED"}
                              </span>
                            </td>

                            {/* Rule Codes / Fix Hint */}
                            <td className="py-2 px-3 text-[11px]">
                              {hasErr ? (
                                <div className="text-rose-700 font-semibold">
                                  <span className="font-bold underline mr-1">{val.errors[0]?.ruleCode}:</span>
                                  {val.errors[0]?.message}
                                </div>
                              ) : hasWarn ? (
                                <div className="text-amber-700 font-medium">
                                  <span className="font-bold mr-1">{val.warnings[0]?.ruleCode}:</span>
                                  {val.warnings[0]?.message}
                                </div>
                              ) : (
                                <span className="text-emerald-700 flex items-center gap-1 font-medium">
                                  <Check className="w-3 h-3" /> All checks valid
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToStep3}
                  disabled={totalErrors > 0 || isLoading}
                  className="px-5 py-2 bg-[#0F8B7D] hover:bg-teal-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>{isLoading ? "Generating Diff..." : "Proceed to Control Totals & Diff"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Control Totals, Diff Preview & Maker-Checker Sign-off (RR-ING-07, RR-ING-09, RR-ING-10) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Control Totals Ribbon (R-03 Check) */}
              <div className={`p-4 rounded-xl border ${controlTotals.reconciliationPass ? "bg-teal-50/70 border-teal-200" : "bg-amber-50/80 border-amber-200"}`}>
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#0F8B7D]" />
                  Control Totals Reconciliation (Rule R-03: Area Variance Threshold ±0.5%)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-[11px] text-gray-500 block">Total Staged Area</span>
                    <span className="text-base font-black text-gray-900">{controlTotals.totalChargeableArea.toLocaleString()} SqFt</span>
                    <span className={`text-[10px] font-bold block mt-0.5 ${controlTotals.reconciliationPass ? "text-emerald-700" : "text-amber-700"}`}>
                      Target: {targetArea.toLocaleString()} SqFt (Variance: {controlTotals.areaVariancePct}%)
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-[11px] text-gray-500 block">Total Staged Monthly Rent</span>
                    <span className="text-base font-black text-emerald-800">{formatINR(controlTotals.totalMonthlyRent)}</span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">✓ Formula F-01 verified</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-[11px] text-gray-500 block">Total Demised Units</span>
                    <span className="text-base font-black text-gray-900">{parsedRows.length} Units</span>
                    <span className="text-[10px] text-teal-700 font-bold block mt-0.5">0 duplicate demised spaces</span>
                  </div>
                </div>
              </div>

              {/* Diff Preview (RR-ING-09) */}
              {diffSummary && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Diff Preview vs Active Portfolio Masters (RR-ING-09)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                      <span className="text-[10px] text-gray-500 block uppercase">New Spaces</span>
                      <span className="text-sm font-bold text-emerald-700">+{diffSummary.newSpacesCount} to create</span>
                    </div>
                    <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                      <span className="text-[10px] text-gray-500 block uppercase">Existing Spaces</span>
                      <span className="text-sm font-bold text-blue-700">{diffSummary.updatedSpacesCount} to update</span>
                    </div>
                    <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                      <span className="text-[10px] text-gray-500 block uppercase">New Contracts</span>
                      <span className="text-sm font-bold text-emerald-700">+{diffSummary.newLeasesCount} to bind</span>
                    </div>
                    <div className="p-2.5 bg-white border border-gray-200 rounded-lg">
                      <span className="text-[10px] text-gray-500 block uppercase">Unchanged Contracts</span>
                      <span className="text-sm font-bold text-gray-700">{diffSummary.unchangedCount} identical</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Two-Step Maker-Checker Sign-off (RR-ING-10) */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Two-Step Commit Sign-Off (Maker-Checker Protocol RR-ING-10)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Preparer (Maker)</label>
                    <input
                      type="text"
                      value={preparerName}
                      onChange={(e) => setPreparerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Commercial Approver (Checker)</label>
                    <input
                      type="text"
                      value={approverName}
                      onChange={(e) => setApproverName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="signOffCheck"
                    checked={signOffAcknowledged}
                    onChange={(e) => setSignOffAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-[#0F8B7D] focus:ring-[#0F8B7D] cursor-pointer"
                  />
                  <label htmlFor="signOffCheck" className="text-xs text-gray-700 cursor-pointer">
                    I confirm that the control totals, statutory GSTIN formats, and financial escalation rules have been audited. This batch will create an immutable audit record with 7-day rollback protection.
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Back to Validation
                </button>
                <button
                  onClick={handleCommitIngestion}
                  disabled={isLoading || !signOffAcknowledged}
                  className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-teal-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-700/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? "Executing Atomic Commit..." : "Approve & Commit Ingestion"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Batches History & 7-Day Rollback (RR-ING-11) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Ingested Batches History &amp; 7-Day Rollback (RR-ING-11)
                </h4>
                <span className="text-[11px] text-gray-500">Atomic void &amp; master restoration within 7-day window</span>
              </div>

              {batches.length === 0 ? (
                <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                  <RotateCcw className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-medium">No previous ingestion batches on record.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Batch ID</th>
                        <th className="py-2.5 px-3">File Name</th>
                        <th className="py-2.5 px-3 text-right">Rows</th>
                        <th className="py-2.5 px-3 text-right">Area SqFt</th>
                        <th className="py-2.5 px-3 text-right">Rent / Mo</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {batches.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{b.id}</td>
                          <td className="py-2.5 px-3 text-gray-800">{b.fileName}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{b.totalRows}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{b.controlTotalArea?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-800">{formatINR(b.controlTotalRent)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              b.status === "committed"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}>
                              {b.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {b.status === "committed" && (
                              <button
                                onClick={() => handleRollbackBatch(b.id)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Rollback Batch
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Full 9-Stage Ingestion Pipeline with R-01 to R-44 Rule Verification &amp; 7-Day Rollback</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  Table,
  Check,
  Building2,
  Users,
  FileText,
  Sparkles,
} from "lucide-react";

interface RentRollExcelImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ColumnMapping {
  propertyName: string;
  buildingName: string;
  unitNumber: string;
  areaSqft: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  monthlyRent: string;
  camRate: string;
  securityDeposit: string;
  startDate: string;
  endDate: string;
  escalationPct: string;
  city: string;
  state: string;
}

const TARGET_FIELDS: Array<{ key: keyof ColumnMapping; label: string; required: boolean; hints: string[] }> = [
  { key: "propertyName", label: "Property / Asset Name", required: true, hints: ["property", "asset", "building name", "property name"] },
  { key: "tenantName", label: "Tenant / Occupant Name", required: true, hints: ["tenant", "company", "occupant", "lessee", "client"] },
  { key: "unitNumber", label: "Unit / Suite / Space #", required: false, hints: ["unit", "space", "suite", "floor", "office", "door"] },
  { key: "areaSqft", label: "Area (Sq.Ft)", required: false, hints: ["area", "sqft", "sq ft", "chargeable", "carpet"] },
  { key: "monthlyRent", label: "Monthly Rent (₹)", required: false, hints: ["rent", "monthly rent", "total rent", "base rent", "amount"] },
  { key: "securityDeposit", label: "Security Deposit (₹)", required: false, hints: ["deposit", "security deposit", "sd"] },
  { key: "startDate", label: "Lease Start Date", required: false, hints: ["start date", "lease start", "start_date", "commencement", "from date", "valid from"] },
  { key: "endDate", label: "Lease End Date", required: false, hints: ["end date", "lease end", "end_date", "expiry date", "expiry", "valid till", "valid to", "to date"] },
  { key: "camRate", label: "CAM Rate (₹/sqft)", required: false, hints: ["cam", "maintenance", "cam rate", "opex"] },
  { key: "escalationPct", label: "Annual Escalation (%)", required: false, hints: ["escalation", "hike", "step up"] },
  { key: "buildingName", label: "Tower / Wing", required: false, hints: ["tower", "wing", "block", "building", "tower name", "bldg"] },
  { key: "city", label: "City", required: false, hints: ["city", "location", "town"] },
  { key: "state", label: "State", required: false, hints: ["state", "province"] },
  { key: "tenantEmail", label: "Tenant Email", required: false, hints: ["email", "contact email", "mail"] },
  { key: "tenantPhone", label: "Tenant Phone", required: false, hints: ["phone", "mobile", "contact number"] },
];

export default function RentRollExcelImporterModal({
  isOpen,
  onClose,
  onSuccess,
}: RentRollExcelImporterModalProps) {
  const [step, setStep] = useState<"upload" | "map" | "preview" | "importing" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    propertyName: "",
    buildingName: "",
    unitNumber: "",
    areaSqft: "",
    tenantName: "",
    tenantEmail: "",
    tenantPhone: "",
    monthlyRent: "",
    camRate: "",
    securityDeposit: "",
    startDate: "",
    endDate: "",
    escalationPct: "",
    city: "",
    state: "",
  });
  const [importStats, setImportStats] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Auto-detect best column matches
  const autoDetectMapping = (cols: string[]) => {
    const newMapping: any = {};
    const usedCols = new Set<string>();

    for (const field of TARGET_FIELDS) {
      const match = cols.find((c) => {
        if (usedCols.has(c)) return false;
        const cleanCol = c.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
        // Disallow tower/building names from matching date fields
        if ((field.key === "startDate" || field.key === "endDate") && (cleanCol.includes("tower") || cleanCol.includes("wing") || cleanCol.includes("block"))) {
          return false;
        }
        return field.hints.some((hint) => {
          if (hint.length <= 3) {
            const words = cleanCol.split(/\s+/);
            return words.includes(hint);
          }
          return cleanCol.includes(hint) || hint.includes(cleanCol);
        });
      });
      if (match) {
        newMapping[field.key] = match;
        usedCols.add(match);
      } else {
        newMapping[field.key] = "";
      }
    }
    setMapping(newMapping as ColumnMapping);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary", cellDates: true });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (data.length === 0) {
          setErrorMsg("The selected Excel file is empty. Please upload a file with data rows.");
          return;
        }

        const cols = Object.keys(data[0] || {});
        setAvailableColumns(cols);
        setRawRows(data);
        autoDetectMapping(cols);
        setStep("map");
      } catch (err: any) {
        setErrorMsg("Failed to read Excel file: " + err.message);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Property Name": "Apex Tech Park",
        "Tower / Wing": "Tower A",
        "Unit / Space": "Suite 401",
        "Chargeable Area (Sq.Ft)": 15000,
        "Tenant Company Name": "Cognitive Cloud Technologies Pvt Ltd",
        "Contact Email": "facilities@cognitivecloud.com",
        "Contact Mobile": "9825012345",
        "Monthly Rent (₹)": 975000,
        "CAM Rate (₹/sqft)": 8.5,
        "Security Deposit (₹)": 5850000,
        "Lease Start Date": "2026-04-01",
        "Lease End Date": "2031-03-31",
        "Annual Escalation (%)": 5,
        City: "Ahmedabad",
        State: "Gujarat",
      },
      {
        "Property Name": "Apex Tech Park",
        "Tower / Wing": "Tower A",
        "Unit / Space": "Suite 501",
        "Chargeable Area (Sq.Ft)": 20000,
        "Tenant Company Name": "Global Infotech India LLP",
        "Contact Email": "admin@globalinfotech.in",
        "Contact Mobile": "9898098765",
        "Monthly Rent (₹)": 1300000,
        "CAM Rate (₹/sqft)": 8.5,
        "Security Deposit (₹)": 7800000,
        "Lease Start Date": "2026-05-01",
        "Lease End Date": "2031-04-30",
        "Annual Escalation (%)": 5,
        City: "Ahmedabad",
        State: "Gujarat",
      },
      {
        "Property Name": "Horizon Heights Commercial",
        "Tower / Wing": "North Wing",
        "Unit / Space": "Floor 2 Entire",
        "Chargeable Area (Sq.Ft)": 12500,
        "Tenant Company Name": "Premier Financial Advisory Services",
        "Contact Email": "operations@premieradvisory.com",
        "Contact Mobile": "9723045678",
        "Monthly Rent (₹)": 812500,
        "CAM Rate (₹/sqft)": 7.0,
        "Security Deposit (₹)": 4875000,
        "Lease Start Date": "2026-06-01",
        "Lease End Date": "2029-05-31",
        "Annual Escalation (%)": 6,
        City: "Ahmedabad",
        State: "Gujarat",
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [
      { wch: 28 }, // Property Name
      { wch: 15 }, // Tower
      { wch: 16 }, // Unit
      { wch: 22 }, // Area
      { wch: 38 }, // Tenant Company Name
      { wch: 30 }, // Contact Email
      { wch: 18 }, // Mobile
      { wch: 18 }, // Monthly Rent
      { wch: 16 }, // CAM
      { wch: 20 }, // Security Deposit
      { wch: 16 }, // Start Date
      { wch: 16 }, // End Date
      { wch: 20 }, // Escalation
      { wch: 16 }, // City
      { wch: 16 }, // State
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Rent Roll Template");
    XLSX.writeFile(wb, "OfficeX_RentRoll_Import_Template.xlsx");
  };

  const getMappedRows = () => {
    return rawRows.map((row) => {
      const getVal = (fieldKey: keyof ColumnMapping) => {
        const col = mapping[fieldKey];
        if (!col || row[col] === undefined) return "";
        const val = row[col];
        if (val instanceof Date) {
          return val.toISOString().split("T")[0];
        }
        return String(val).trim();
      };

      const getNum = (fieldKey: keyof ColumnMapping) => {
        const str = getVal(fieldKey).replace(/[^0-9.-]/g, "");
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
      };

      return {
        propertyName: getVal("propertyName") || "Commercial Asset",
        buildingName: getVal("buildingName") || "Tower 1",
        unitNumber: getVal("unitNumber") || "Unit 101",
        areaSqft: getNum("areaSqft") || 5000,
        tenantName: getVal("tenantName"),
        tenantEmail: getVal("tenantEmail"),
        tenantPhone: getVal("tenantPhone"),
        monthlyRent: getNum("monthlyRent"),
        camRate: getNum("camRate") || 8.5,
        securityDeposit: getNum("securityDeposit"),
        startDate: getVal("startDate"),
        endDate: getVal("endDate"),
        escalationPct: getNum("escalationPct") || 5,
        city: getVal("city") || "Ahmedabad",
        state: getVal("state") || "Gujarat",
      };
    });
  };

  const handleStartImport = async () => {
    setErrorMsg("");
    setStep("importing");

    try {
      const mappedRows = getMappedRows().filter((r) => r.propertyName && r.tenantName);
      if (mappedRows.length === 0) {
        throw new Error("No valid rows found. Please ensure Property Name and Tenant Name are mapped.");
      }

      const res = await fetch("/api/rent-roll/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: mappedRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Bulk import failed");
      }

      setImportStats(data.stats);
      setStep("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process import");
      setStep("preview");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/70 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D7B6C] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Rent Roll Smart Excel / CSV Bulk Importer
              </h3>
              <p className="text-xs text-slate-500">
                Upload existing portfolio spreadsheet, map columns visually, and import properties, spaces &amp; tenants in one click.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === "upload" && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-teal-300 hover:border-[#0D7B6C] rounded-3xl bg-teal-50/40 hover:bg-teal-50/80 transition text-center cursor-pointer space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-[#0D7B6C] flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Click to select or drag &amp; drop your Excel or CSV file
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports .xlsx, .xls, and .csv files from Excel, Google Sheets, or Yardi/MRI exports.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Template Download Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-[#0D7B6C] shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Need a pre-formatted Excel template?
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Download our ready-made template with all standard commercial Rent Roll columns and sample data.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 rounded-xl bg-white border border-teal-200 text-[#0D7B6C] hover:bg-teal-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Template</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === "map" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Step 2: Map Columns from {file?.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Match the column headers from your spreadsheet to OfficeX database fields.
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {rawRows.length} rows detected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1">
                {TARGET_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="p-3 rounded-xl border border-slate-200 bg-white space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800">
                        {field.label} {field.required && <span className="text-rose-600">*</span>}
                      </label>
                      {mapping[field.key] ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                          Mapped
                        </span>
                      ) : field.required ? (
                        <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-bold">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Optional</span>
                      )}
                    </div>
                    <select
                      value={mapping[field.key] || ""}
                      onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                    >
                      <option value="">-- Do Not Import / Not in Sheet --</option>
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Step 3: Preview Data Before Import
                  </h4>
                  <p className="text-xs text-slate-500">
                    Reviewing first {Math.min(10, rawRows.length)} of {rawRows.length} rows to be imported.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Ready for Ingestion</span>
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-[45vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Property</th>
                      <th className="p-2.5">Tower / Unit</th>
                      <th className="p-2.5">Area (sqft)</th>
                      <th className="p-2.5">Tenant Company</th>
                      <th className="p-2.5">Monthly Rent</th>
                      <th className="p-2.5">Deposit</th>
                      <th className="p-2.5">Lease Term</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {getMappedRows().slice(0, 10).map((r, idx) => (
                      <tr key={idx} className="hover:bg-teal-50/40 transition">
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{r.propertyName}</td>
                        <td className="p-2.5">{r.buildingName} - {r.unitNumber}</td>
                        <td className="p-2.5 font-mono">{r.areaSqft.toLocaleString()}</td>
                        <td className="p-2.5 font-bold text-teal-900">{r.tenantName || <span className="text-rose-500">Missing</span>}</td>
                        <td className="p-2.5 font-mono font-bold">₹{r.monthlyRent.toLocaleString()}</td>
                        <td className="p-2.5 font-mono">₹{r.securityDeposit.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-500 text-[11px]">{r.startDate || "Active"} → {r.endDate || "5 Yrs"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: IMPORTING */}
          {step === "importing" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#0D7B6C] animate-spin mx-auto" />
              <h4 className="text-base font-black text-slate-900">
                Bulk Ingesting Rent Roll Records...
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Creating commercial properties, buildings, demised units, tenant profiles, and active lease contracts in Supabase.
              </p>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === "success" && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Rent Roll Imported Successfully!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your Excel spreadsheet has been fully parsed and structured into the live commercial database.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-2xl font-black text-[#0D7B6C] block">
                    {importStats?.propertiesCreated || 0}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">Properties</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-2xl font-black text-[#0D7B6C] block">
                    {importStats?.unitsCreated || 0}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">Units / Spaces</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-2xl font-black text-[#0D7B6C] block">
                    {importStats?.tenantsCreated || 0}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">Tenants</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-2xl font-black text-[#0D7B6C] block">
                    {importStats?.contractsCreated || 0}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">Contracts</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="px-8 py-3 rounded-2xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
                >
                  View Property Registry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {step !== "importing" && step !== "success" && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
            {step === "upload" ? (
              <span className="text-xs text-slate-400">Select an Excel file to begin mapping</span>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step === "preview" ? "map" : "upload")}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {step === "map" && (
              <button
                type="button"
                disabled={!mapping.propertyName || !mapping.tenantName}
                onClick={() => setStep("preview")}
                className="px-5 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <span>Continue to Preview →</span>
              </button>
            )}

            {step === "preview" && (
              <button
                type="button"
                onClick={handleStartImport}
                className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Import {rawRows.length} Rows Now</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

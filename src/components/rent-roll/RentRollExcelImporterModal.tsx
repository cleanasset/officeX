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
  // Property & Landlord Details
  propertyName: string;
  propertyType: string;
  propertyAddress: string;
  city: string;
  state: string;
  pincode: string;
  landlordSpv: string;
  landlordPan: string;
  landlordGstin: string;
  // Building, Floor & Space Hierarchy
  buildingName: string;
  floor: string;
  unitNumber: string;
  areaSqft: string;
  // Tenant Master & Legal Metadata
  tenantName: string;
  tradeName: string;
  tenantPan: string;
  tenantGstin: string;
  tenantCin: string;
  tenantAddress: string;
  signatoryName: string;
  tenantEmail: string;
  tenantPhone: string;
  // Commercial Lease Terms & Financials
  startDate: string;
  endDate: string;
  monthlyRent: string;
  camRate: string;
  securityDeposit: string;
  rentFreeDays: string;
  lockInMonths: string;
  noticePeriodMonths: string;
  escalationPct: string;
}

const TARGET_FIELDS: Array<{
  key: keyof ColumnMapping;
  label: string;
  required: boolean;
  category: "Property & Landlord" | "Tower, Floor & Unit" | "Tenant Master" | "Commercial Lease Terms";
  hints: string[];
}> = [
  // 1. Property & Landlord
  {
    key: "propertyName",
    label: "Property / Asset Name",
    required: true,
    category: "Property & Landlord",
    hints: ["property", "asset", "building name", "property name", "project name"],
  },
  {
    key: "propertyType",
    label: "Property Type (Office/Retail/etc.)",
    required: false,
    category: "Property & Landlord",
    hints: ["property type", "asset type", "usage", "type"],
  },
  {
    key: "propertyAddress",
    label: "Property Address",
    required: false,
    category: "Property & Landlord",
    hints: ["property address", "premise address", "site address", "location address"],
  },
  {
    key: "city",
    label: "City",
    required: false,
    category: "Property & Landlord",
    hints: ["city", "location", "town"],
  },
  {
    key: "state",
    label: "State",
    required: false,
    category: "Property & Landlord",
    hints: ["state", "province"],
  },
  {
    key: "pincode",
    label: "Pincode / Postal Code",
    required: false,
    category: "Property & Landlord",
    hints: ["pincode", "pin code", "postal code", "zip", "zip code"],
  },
  {
    key: "landlordSpv",
    label: "Landlord SPV / Entity Name",
    required: false,
    category: "Property & Landlord",
    hints: ["landlord", "spv", "landlord spv", "lessor", "owning entity", "owner name", "landlord entity"],
  },
  {
    key: "landlordPan",
    label: "Landlord PAN",
    required: false,
    category: "Property & Landlord",
    hints: ["landlord pan", "lessor pan", "owner pan"],
  },
  {
    key: "landlordGstin",
    label: "Landlord GSTIN",
    required: false,
    category: "Property & Landlord",
    hints: ["landlord gstin", "lessor gstin", "owner gstin", "landlord gst"],
  },

  // 2. Tower, Floor & Space Hierarchy
  {
    key: "buildingName",
    label: "Tower / Wing / Block",
    required: false,
    category: "Tower, Floor & Unit",
    hints: ["tower", "wing", "block", "building", "tower name", "bldg"],
  },
  {
    key: "floor",
    label: "Floor / Level",
    required: false,
    category: "Tower, Floor & Unit",
    hints: ["floor", "level", "storey", "flr", "floor number", "floor level"],
  },
  {
    key: "unitNumber",
    label: "Unit / Suite / Space #",
    required: false,
    category: "Tower, Floor & Unit",
    hints: ["unit", "space", "suite", "office", "door", "unit number", "space id", "demised premises"],
  },
  {
    key: "areaSqft",
    label: "Chargeable Area (Sq.Ft)",
    required: false,
    category: "Tower, Floor & Unit",
    hints: ["area", "sqft", "sq ft", "chargeable", "chargeable area", "carpet", "leasable area", "area sqft"],
  },

  // 3. Tenant Master & Legal Metadata
  {
    key: "tenantName",
    label: "Tenant Company Name",
    required: true,
    category: "Tenant Master",
    hints: ["tenant", "company", "occupant", "lessee", "client", "tenant company", "tenant name", "lessee name"],
  },
  {
    key: "tradeName",
    label: "Trade Name / Brand",
    required: false,
    category: "Tenant Master",
    hints: ["trade name", "brand", "brand name", "dba"],
  },
  {
    key: "tenantPan",
    label: "Tenant PAN",
    required: false,
    category: "Tenant Master",
    hints: ["tenant pan", "lessee pan", "pan", "pan number", "pan no"],
  },
  {
    key: "tenantGstin",
    label: "Tenant GSTIN",
    required: false,
    category: "Tenant Master",
    hints: ["tenant gstin", "lessee gstin", "gstin", "gst", "gst number", "gst no"],
  },
  {
    key: "tenantCin",
    label: "Tenant CIN Number",
    required: false,
    category: "Tenant Master",
    hints: ["cin", "cin number", "corporate id", "cin no", "corporate identification"],
  },
  {
    key: "tenantAddress",
    label: "Tenant Registered Billing Address",
    required: false,
    category: "Tenant Master",
    hints: ["tenant address", "billing address", "registered address", "lessee address"],
  },
  {
    key: "signatoryName",
    label: "Authorized Signatory / Contact Person",
    required: false,
    category: "Tenant Master",
    hints: ["signatory", "signatory name", "contact person", "authorized signatory", "representative", "contact name"],
  },
  {
    key: "tenantEmail",
    label: "Contact Email",
    required: false,
    category: "Tenant Master",
    hints: ["email", "contact email", "mail", "tenant email"],
  },
  {
    key: "tenantPhone",
    label: "Contact Mobile / Phone",
    required: false,
    category: "Tenant Master",
    hints: ["phone", "mobile", "contact number", "tenant phone", "contact mobile"],
  },

  // 4. Commercial Lease Terms & Financials
  {
    key: "startDate",
    label: "Lease Start Date",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["start date", "lease start", "start_date", "commencement", "from date", "valid from", "agreement date"],
  },
  {
    key: "endDate",
    label: "Lease End Date",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["end date", "lease end", "end_date", "expiry date", "expiry", "valid till", "valid to", "to date"],
  },
  {
    key: "monthlyRent",
    label: "Monthly Base Rent (₹)",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["rent", "monthly rent", "total rent", "base rent", "amount", "monthly amount"],
  },
  {
    key: "camRate",
    label: "CAM Rate (₹/sqft)",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["cam", "maintenance", "cam rate", "opex", "cam psf", "maintenance rate"],
  },
  {
    key: "securityDeposit",
    label: "Security Deposit (₹)",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["deposit", "security deposit", "sd", "caution deposit"],
  },
  {
    key: "rentFreeDays",
    label: "Rent Free Days (Fitout)",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["rent free", "rent free days", "fitout days", "fit-out period", "fitout period", "rent free period"],
  },
  {
    key: "lockInMonths",
    label: "Lock-in Period (Months)",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["lock in", "lock-in", "lock in months", "lockin", "lock in period"],
  },
  {
    key: "noticePeriodMonths",
    label: "Notice Period (Months)",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["notice", "notice period", "notice months", "notice period months"],
  },
  {
    key: "escalationPct",
    label: "Annual Escalation (%)",
    required: false,
    category: "Commercial Lease Terms",
    hints: ["escalation", "hike", "step up", "annual escalation", "escalation pct", "escalation %"],
  },
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
    propertyType: "",
    propertyAddress: "",
    city: "",
    state: "",
    pincode: "",
    landlordSpv: "",
    landlordPan: "",
    landlordGstin: "",
    buildingName: "",
    floor: "",
    unitNumber: "",
    areaSqft: "",
    tenantName: "",
    tradeName: "",
    tenantPan: "",
    tenantGstin: "",
    tenantCin: "",
    tenantAddress: "",
    signatoryName: "",
    tenantEmail: "",
    tenantPhone: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    camRate: "",
    securityDeposit: "",
    rentFreeDays: "",
    lockInMonths: "",
    noticePeriodMonths: "",
    escalationPct: "",
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
      // 1. Try exact or sanitized exact match first
      const exactMatch = cols.find((c) => {
        if (usedCols.has(c)) return false;
        const cleanCol = c.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
        const cleanLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
        return cleanCol === cleanLabel;
      });

      if (exactMatch) {
        newMapping[field.key] = exactMatch;
        usedCols.add(exactMatch);
        continue;
      }

      // 2. Try hints
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
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array", cellDates: true });
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
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Property Name": "Apex Tech Park",
        "Property Type": "Office",
        "Property Address": "Plot 101, SG Highway, Bodakdev",
        "City": "Ahmedabad",
        "State": "Gujarat",
        "Pincode": "380054",
        "Landlord SPV Name": "Apex Real Estate Developers LLP",
        "Landlord PAN": "AABCA1234F",
        "Landlord GSTIN": "24AABCA1234F1Z8",
        "Tower / Wing": "Tower A",
        "Floor": "4",
        "Unit / Space": "Suite 401",
        "Chargeable Area (Sq.Ft)": 15000,
        "Tenant Company Name": "Cognitive Cloud Technologies Pvt Ltd",
        "Trade Name": "Cognitive Cloud",
        "Tenant PAN": "AAACC1234F",
        "Tenant GSTIN": "24AAACC1234F1Z5",
        "Tenant CIN": "U72200GJ2020PTC112345",
        "Tenant Billing Address": "Suite 401, Apex Tech Park, SG Highway, Ahmedabad",
        "Contact Person": "Rajesh Sharma",
        "Contact Email": "facilities@cognitivecloud.com",
        "Contact Mobile": "9825012345",
        "Monthly Rent (₹)": 975000,
        "CAM Rate (₹/sqft)": 8.5,
        "Security Deposit (₹)": 5850000,
        "Lease Start Date": "2026-04-01",
        "Lease End Date": "2031-03-31",
        "Rent Free Days": 60,
        "Lock-in Period (Months)": 24,
        "Notice Period (Months)": 3,
        "Annual Escalation (%)": 5,
      },
      {
        "Property Name": "Apex Tech Park",
        "Property Type": "Office",
        "Property Address": "Plot 101, SG Highway, Bodakdev",
        "City": "Ahmedabad",
        "State": "Gujarat",
        "Pincode": "380054",
        "Landlord SPV Name": "Apex Real Estate Developers LLP",
        "Landlord PAN": "AABCA1234F",
        "Landlord GSTIN": "24AABCA1234F1Z8",
        "Tower / Wing": "Tower A",
        "Floor": "5",
        "Unit / Space": "Suite 501",
        "Chargeable Area (Sq.Ft)": 20000,
        "Tenant Company Name": "Global Infotech India LLP",
        "Trade Name": "Global Infotech",
        "Tenant PAN": "AABBG9876K",
        "Tenant GSTIN": "24AABBG9876K1Z3",
        "Tenant CIN": "AAA-1234",
        "Tenant Billing Address": "Suite 501, Apex Tech Park, SG Highway, Ahmedabad",
        "Contact Person": "Priya Patel",
        "Contact Email": "admin@globalinfotech.in",
        "Contact Mobile": "9898098765",
        "Monthly Rent (₹)": 1300000,
        "CAM Rate (₹/sqft)": 8.5,
        "Security Deposit (₹)": 7800000,
        "Lease Start Date": "2026-05-01",
        "Lease End Date": "2031-04-30",
        "Rent Free Days": 30,
        "Lock-in Period (Months)": 36,
        "Notice Period (Months)": 3,
        "Annual Escalation (%)": 5,
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [
      { wch: 24 }, // Property Name
      { wch: 16 }, // Property Type
      { wch: 32 }, // Property Address
      { wch: 16 }, // City
      { wch: 16 }, // State
      { wch: 12 }, // Pincode
      { wch: 30 }, // Landlord SPV
      { wch: 16 }, // Landlord PAN
      { wch: 18 }, // Landlord GSTIN
      { wch: 15 }, // Tower
      { wch: 10 }, // Floor
      { wch: 16 }, // Unit
      { wch: 22 }, // Area
      { wch: 38 }, // Tenant Company Name
      { wch: 20 }, // Trade Name
      { wch: 16 }, // Tenant PAN
      { wch: 20 }, // Tenant GSTIN
      { wch: 24 }, // Tenant CIN
      { wch: 36 }, // Tenant Address
      { wch: 20 }, // Contact Person
      { wch: 30 }, // Contact Email
      { wch: 18 }, // Contact Mobile
      { wch: 18 }, // Monthly Rent
      { wch: 16 }, // CAM
      { wch: 20 }, // Security Deposit
      { wch: 16 }, // Start Date
      { wch: 16 }, // End Date
      { wch: 16 }, // Rent Free Days
      { wch: 22 }, // Lock-in Period
      { wch: 20 }, // Notice Period
      { wch: 20 }, // Escalation
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
        propertyType: getVal("propertyType") || "Office",
        propertyAddress: getVal("propertyAddress"),
        city: getVal("city") || "Ahmedabad",
        state: getVal("state") || "Gujarat",
        pincode: getVal("pincode"),
        landlordSpv: getVal("landlordSpv"),
        landlordPan: getVal("landlordPan"),
        landlordGstin: getVal("landlordGstin"),
        buildingName: getVal("buildingName") || "Tower A",
        floor: getVal("floor"),
        unitNumber: getVal("unitNumber") || "Unit 101",
        areaSqft: getNum("areaSqft") || 5000,
        tenantName: getVal("tenantName"),
        tradeName: getVal("tradeName"),
        tenantPan: getVal("tenantPan"),
        tenantGstin: getVal("tenantGstin"),
        tenantCin: getVal("tenantCin"),
        tenantAddress: getVal("tenantAddress"),
        signatoryName: getVal("signatoryName"),
        tenantEmail: getVal("tenantEmail"),
        tenantPhone: getVal("tenantPhone"),
        monthlyRent: getNum("monthlyRent"),
        camRate: getNum("camRate") || 8.5,
        securityDeposit: getNum("securityDeposit"),
        startDate: getVal("startDate"),
        endDate: getVal("endDate"),
        rentFreeDays: getNum("rentFreeDays"),
        lockInMonths: getNum("lockInMonths") || 12,
        noticePeriodMonths: getNum("noticePeriodMonths") || 3,
        escalationPct: getNum("escalationPct") || 5,
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
                    Match the column headers from your spreadsheet to OfficeX database fields. Standard columns are auto-detected.
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {rawRows.length} rows detected
                </span>
              </div>

              {/* Grouped mapping by category */}
              <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
                {(
                  [
                    "Property & Landlord",
                    "Tower, Floor & Unit",
                    "Tenant Master",
                    "Commercial Lease Terms",
                  ] as const
                ).map((categoryName) => {
                  const categoryFields = TARGET_FIELDS.filter((f) => f.category === categoryName);
                  const mappedInCat = categoryFields.filter((f) => mapping[f.key]).length;

                  return (
                    <div key={categoryName} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-3">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                            {categoryName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {mappedInCat} of {categoryFields.length} mapped
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {categoryFields.map((field) => (
                          <div
                            key={field.key}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <label className="font-bold text-slate-800 truncate" title={field.label}>
                                {field.label} {field.required && <span className="text-rose-600">*</span>}
                              </label>
                              {mapping[field.key] ? (
                                <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200 shrink-0">
                                  Mapped
                                </span>
                              ) : field.required ? (
                                <span className="text-[9px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold border border-rose-200 shrink-0">
                                  Required
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 shrink-0">Optional</span>
                              )}
                            </div>
                            <select
                              value={mapping[field.key] || ""}
                              onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer bg-white"
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
                  );
                })}
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

              <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-[48vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Property &amp; SPV</th>
                      <th className="p-2.5">Tower &amp; Floor</th>
                      <th className="p-2.5">Unit / Space</th>
                      <th className="p-2.5">Area (sqft)</th>
                      <th className="p-2.5">Tenant &amp; PAN/GSTIN</th>
                      <th className="p-2.5">Monthly Rent</th>
                      <th className="p-2.5">CAM Rate</th>
                      <th className="p-2.5">Deposit</th>
                      <th className="p-2.5">Lease Term &amp; Lock-in</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {getMappedRows().slice(0, 10).map((r, idx) => (
                      <tr key={idx} className="hover:bg-teal-50/40 transition">
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5">
                          <span className="font-bold text-slate-900 block">{r.propertyName}</span>
                          {r.landlordSpv ? (
                            <span className="text-[10px] text-slate-500 font-normal block">{r.landlordSpv}</span>
                          ) : null}
                        </td>
                        <td className="p-2.5">
                          <span className="block font-semibold">{r.buildingName}</span>
                          <span className="text-[10px] text-teal-700 font-medium">
                            {r.floor ? `Floor ${r.floor}` : "Ground Floor"}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-700">{r.unitNumber}</td>
                        <td className="p-2.5 font-mono">{r.areaSqft.toLocaleString()}</td>
                        <td className="p-2.5">
                          <span className="font-bold text-teal-900 block">
                            {r.tenantName || <span className="text-rose-500">Missing</span>}
                          </span>
                          {(r.tenantPan || r.tenantGstin) && (
                            <span className="text-[10px] font-mono text-slate-500 block">
                              {[r.tenantPan ? `PAN: ${r.tenantPan}` : null, r.tenantGstin ? `GST: ${r.tenantGstin}` : null]
                                .filter(Boolean)
                                .join(" | ")}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">₹{r.monthlyRent.toLocaleString()}</td>
                        <td className="p-2.5 font-mono text-slate-600">₹{r.camRate}/sqft</td>
                        <td className="p-2.5 font-mono text-slate-600">₹{r.securityDeposit.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-500 text-[11px]">
                          <span className="block">{r.startDate || "Active"} → {r.endDate || "5 Yrs"}</span>
                          <span className="text-[10px] text-indigo-700 font-semibold block">
                            Lock-in: {r.lockInMonths} mo | Notice: {r.noticePeriodMonths} mo
                          </span>
                        </td>
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

              {importStats?.warnings && importStats.warnings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 max-w-lg mx-auto text-left space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Import Notes ({importStats.warnings.length} items flagged):</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800/90 max-h-24 overflow-y-auto">
                    {importStats.warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

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

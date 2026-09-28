"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  FileUp,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Eye,
  Layers,
  Building,
  Copy,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export interface LeasableSpaceUnit {
  id: string;
  spaceCode: string;
  suiteNumber: string;
  buildingCode: string;
  floorNumber: number;
  spaceType: "office" | "retail" | "food_court" | "storage" | "parking_block" | "terrace" | "antenna_site" | "flex_floor" | "cabin" | "meeting_room" | "other";
  chargeableArea: number;
  carpetArea: number;
  askingRate: number;
  seatCapacity: number;
  fitoutCondition: "bare_shell" | "warm_shell" | "fully_fitted" | "plug_and_play";
  status: "vacant" | "occupied" | "reserved" | "under_fitout" | "not_leasable";
}

interface TowerBuilding {
  id: string;
  name: string;
  code: string;
}

interface BulkImportSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedUnits: LeasableSpaceUnit[]) => void;
  towers: TowerBuilding[];
  defaultTowerCode?: string;
  defaultTargetRent?: number;
  propertyCode?: string;
  areaLabel?: string;
  currentUnitCount?: number;
}

// Definition of standard target fields for OfficeX Space Inventory
interface TargetFieldDef {
  key: string;
  label: string;
  required: boolean;
  aliases: RegExp;
  description: string;
  defaultValueText: string;
  exampleValue: string;
}

const TARGET_FIELDS: TargetFieldDef[] = [
  {
    key: "suiteNumber",
    label: "Suite / Unit Identifier",
    required: true,
    aliases: /suite|unit|identifier|space.*id|number|office|cabin|premise|door/i,
    description: "Unique suite, floor, or room label within the property",
    defaultValueText: "Required",
    exampleValue: "Suite 402"
  },
  {
    key: "floorNumber",
    label: "Floor Number",
    required: true,
    aliases: /floor|level|storey|flr/i,
    description: "Numeric floor level (e.g. 1, 2, 4, 14)",
    defaultValueText: "Defaults to 1",
    exampleValue: "4"
  },
  {
    key: "chargeableArea",
    label: "Chargeable Super Area",
    required: true,
    aliases: /super.*area|chargeable.*area|chargeable|super|sqft|area|size|chg.*area/i,
    description: "Super built-up / chargeable leasable area used for rent billing",
    defaultValueText: "Required (> 0)",
    exampleValue: "5000"
  },
  {
    key: "carpetArea",
    label: "Carpet / Usable Area",
    required: false,
    aliases: /carpet|usable|net.*area|cpt/i,
    description: "Internal usable floor plate area",
    defaultValueText: "Defaults to 75% of Super Area",
    exampleValue: "3750"
  },
  {
    key: "buildingCode",
    label: "Tower / Block Code",
    required: false,
    aliases: /tower|block|building|bldg|wing/i,
    description: "Building or tower code (e.g. T1, Block A)",
    defaultValueText: "Defaults to Main Tower (T1)",
    exampleValue: "T1"
  },
  {
    key: "spaceType",
    label: "Space Classification / Type",
    required: false,
    aliases: /space.*type|type|category|usage|use/i,
    description: "office, retail, food_court, flex_floor, cabin, etc.",
    defaultValueText: "Defaults to 'office'",
    exampleValue: "office"
  },
  {
    key: "askingRate",
    label: "Target Asking Rate (₹/unit)",
    required: false,
    aliases: /asking.*rate|rate|rent|asking|price|psf|rent.*psf/i,
    description: "Expected monthly base rent rate per sq. ft.",
    defaultValueText: "Defaults to property target rent",
    exampleValue: "150"
  },
  {
    key: "fitoutCondition",
    label: "Fitout Condition",
    required: false,
    aliases: /fitout|condition|finish|spec/i,
    description: "warm_shell, bare_shell, fully_fitted, plug_and_play",
    defaultValueText: "Defaults to 'warm_shell'",
    exampleValue: "warm_shell"
  },
  {
    key: "status",
    label: "Inventory Status",
    required: false,
    aliases: /status|availability|occupancy|state/i,
    description: "vacant, occupied, reserved, under_fitout",
    defaultValueText: "Defaults to 'vacant'",
    exampleValue: "vacant"
  },
  {
    key: "seatCapacity",
    label: "Seat / Workstation Capacity",
    required: false,
    aliases: /seat|workstation|desk|capacity|chairs/i,
    description: "Number of flex seats or dedicated workstations",
    defaultValueText: "Defaults to 0",
    exampleValue: "24"
  }
];

// Parser helpers
function parseCSVLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result.map(s => s.replace(/^["']|["']$/g, "").trim());
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] || "";
  if (firstLine.includes("\t")) return "\t";
  if (firstLine.includes(";")) return ";";
  return ",";
}

function cleanNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function normalizeSpaceType(val: string): LeasableSpaceUnit["spaceType"] {
  const s = (val || "").toLowerCase().trim();
  if (s.includes("retail") || s.includes("shop") || s.includes("store")) return "retail";
  if (s.includes("food") || s.includes("cafe") || s.includes("court") || s.includes("f&b")) return "food_court";
  if (s.includes("flex") || s.includes("cowork") || s.includes("co-work")) return "flex_floor";
  if (s.includes("cabin")) return "cabin";
  if (s.includes("meet") || s.includes("conf")) return "meeting_room";
  if (s.includes("store") || s.includes("ware") || s.includes("godown")) return "storage";
  if (s.includes("terrace")) return "terrace";
  return "office";
}

function normalizeFitout(val: string): LeasableSpaceUnit["fitoutCondition"] {
  const s = (val || "").toLowerCase().trim();
  if (s.includes("bare") || s.includes("raw") || s.includes("unfit")) return "bare_shell";
  if (s.includes("fitted") || s.includes("full") || s.includes("furnish")) return "fully_fitted";
  if (s.includes("plug") || s.includes("turnkey")) return "plug_and_play";
  return "warm_shell";
}

function normalizeStatus(val: string): LeasableSpaceUnit["status"] {
  const s = (val || "").toLowerCase().trim();
  if (s.includes("occup") || s.includes("lease") || s.includes("rent")) return "occupied";
  if (s.includes("reserv") || s.includes("block") || s.includes("hold")) return "reserved";
  if (s.includes("fitout") || s.includes("renov")) return "under_fitout";
  return "vacant";
}

export const BulkImportSpaceModal: React.FC<BulkImportSpaceModalProps> = ({
  isOpen,
  onClose,
  onImport,
  towers,
  defaultTowerCode = "T1",
  defaultTargetRent = 0,
  propertyCode = "PROP",
  areaLabel = "sq. ft.",
  currentUnitCount = 0
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modal Step: 1 = Upload / Paste & Template, 2 = Smart Column Mapping, 3 = Preview & Validate
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);

  // Input mode in Step 1: "file" | "paste"
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileSize, setUploadedFileSize] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [showSpecGuide, setShowSpecGuide] = useState<boolean>(false);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);

  // Parsed table state
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvDataRows, setCsvDataRows] = useState<string[][]>([]);
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);

  // Column Mapping: Map<targetKey, csvHeaderName>
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Error message
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalStep(1);
      setErrorMsg("");
    }
  }, [isOpen]);

  // Sample CSV Template content
  const sampleHeaders = [
    "Suite / Unit ID",
    "Tower / Block",
    "Floor Number",
    "Space Type",
    "Super Area (sq.ft)",
    "Carpet Area (sq.ft)",
    "Asking Rate (INR/sq.ft)",
    "Inventory Status",
    "Fitout Condition",
    "Seat Capacity"
  ];

  const sampleRowsData = [
    ["Suite 101", towers[0]?.code || "T1", "1", "office", "5000", "3750", String(defaultTargetRent || 150), "vacant", "warm_shell", "0"],
    ["Suite 102", towers[0]?.code || "T1", "1", "retail", "2500", "1875", String(Math.round((defaultTargetRent || 150) * 1.3)), "vacant", "bare_shell", "0"],
    ["Suite 201", towers[0]?.code || "T1", "2", "office", "10000", "7500", String(defaultTargetRent || 150), "vacant", "warm_shell", "0"],
    ["Floor 3", towers[0]?.code || "T1", "3", "flex_floor", "8500", "6375", String(Math.round((defaultTargetRent || 150) * 1.1)), "vacant", "fully_fitted", "64"],
    ["Suite 401", towers[0]?.code || "T1", "4", "office", "6200", "4650", String(defaultTargetRent || 150), "vacant", "warm_shell", "0"],
    ["Cabin 5A", towers[0]?.code || "T1", "5", "cabin", "1200", "900", String(Math.round((defaultTargetRent || 150) * 1.25)), "vacant", "plug_and_play", "14"]
  ];

  // Download Sample Template Handler
  const handleDownloadTemplate = () => {
    const csvContent = [
      sampleHeaders.join(","),
      ...sampleRowsData.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `officex_space_inventory_template_${propertyCode || "asset"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy sample template headers to clipboard
  const handleCopySampleHeaders = () => {
    const headerStr = sampleHeaders.join(", ");
    navigator.clipboard.writeText(headerStr);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  // Load sample data into paste area
  const handleInsertSampleRows = () => {
    const csvContent = [
      sampleHeaders.join(", "),
      ...sampleRowsData.map(r => r.join(", "))
    ].join("\n");
    setRawText(csvContent);
    setInputMode("paste");
  };

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const sizeKb = Math.round(file.size / 1024);
    setUploadedFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text || !text.trim()) {
        setErrorMsg("Uploaded file is empty.");
        return;
      }
      setRawText(text);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read the uploaded file.");
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      const sizeKb = Math.round(file.size / 1024);
      setUploadedFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text || !text.trim()) {
          setErrorMsg("Uploaded file is empty.");
          return;
        }
        setRawText(text);
      };
      reader.readAsText(file);
    }
  };

  // Step 1 to Step 2: Parse raw text, extract headers, auto-map columns
  const handleProceedToMapping = () => {
    setErrorMsg("");
    if (!rawText.trim()) {
      setErrorMsg("Please upload a CSV file or paste spreadsheet rows to continue.");
      return;
    }

    const delim = detectDelimiter(rawText);
    const lines = rawText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length < 2) {
      setErrorMsg("Data must contain at least 1 header row and 1 inventory data row.");
      return;
    }

    const headers = parseCSVLine(lines[0], delim);
    const dataRows = lines.slice(1).map(l => parseCSVLine(l, delim));

    if (headers.length < 2) {
      setErrorMsg("Could not parse distinct columns. Please check delimiters (comma or tab separated).");
      return;
    }

    setCsvHeaders(headers);
    setCsvDataRows(dataRows);
    setHeaderRowIndex(0);

    // Smart Auto-Mapping Heuristic
    const initialMapping: Record<string, string> = {};
    TARGET_FIELDS.forEach(field => {
      // Find matching header
      const match = headers.find(h => field.aliases.test(h.toLowerCase().trim()));
      if (match) {
        initialMapping[field.key] = match;
      } else {
        initialMapping[field.key] = "";
      }
    });

    setColumnMapping(initialMapping);
    setModalStep(2);
  };

  // Compute mapped units
  const mappedUnits = useMemo<LeasableSpaceUnit[]>(() => {
    if (csvDataRows.length === 0 || csvHeaders.length === 0) return [];

    const propPrefix = propertyCode ? propertyCode.split("-")[0].toUpperCase() : "SP";
    const fallbackTower = towers[0]?.code || defaultTowerCode || "T1";

    const getColumnVal = (row: string[], targetKey: string): string => {
      const mappedHeader = columnMapping[targetKey];
      if (!mappedHeader) return "";
      const colIdx = csvHeaders.indexOf(mappedHeader);
      if (colIdx === -1 || colIdx >= row.length) return "";
      return row[colIdx] || "";
    };

    const results: LeasableSpaceUnit[] = [];

    csvDataRows.forEach((row, idx) => {
      // 1. Suite number
      let suite = getColumnVal(row, "suiteNumber").trim();
      if (!suite) {
        // Fallback: check if row has anything in first column
        suite = row[0]?.trim() || `Unit ${idx + 1}`;
      }

      // 2. Floor number
      const floorRaw = getColumnVal(row, "floorNumber");
      let floorNum = cleanNumber(floorRaw);
      if (floorNum === 0) {
        // Try extracting floor from suite (e.g. "Suite 402" -> floor 4)
        const digits = suite.match(/\d+/);
        if (digits && digits[0].length >= 3) {
          floorNum = parseInt(digits[0].slice(0, -2), 10) || 1;
        } else {
          floorNum = 1;
        }
      }

      // 3. Chargeable Area
      const chgArea = cleanNumber(getColumnVal(row, "chargeableArea"));

      // 4. Carpet Area
      const cptVal = getColumnVal(row, "carpetArea");
      const cptArea = cptVal ? cleanNumber(cptVal) : Math.round(chgArea * 0.75);

      // 5. Tower code
      const towerVal = getColumnVal(row, "buildingCode").trim();
      const tower = towerVal || fallbackTower;

      // 6. Space Type
      const typeVal = getColumnVal(row, "spaceType");
      const spaceType = normalizeSpaceType(typeVal);

      // 7. Asking Rate
      const rateVal = getColumnVal(row, "askingRate");
      const askingRate = rateVal ? cleanNumber(rateVal) : defaultTargetRent || 0;

      // 8. Fitout
      const fitoutVal = getColumnVal(row, "fitoutCondition");
      const fitout = normalizeFitout(fitoutVal);

      // 9. Status
      const statVal = getColumnVal(row, "status");
      const status = normalizeStatus(statVal);

      // 10. Seat Capacity
      const seatsVal = getColumnVal(row, "seatCapacity");
      const seats = cleanNumber(seatsVal);

      const seqNum = currentUnitCount + idx + 1;
      const spaceCode = `${propPrefix}-${tower}-${String(floorNum).padStart(2, "0")}-${String(seqNum).padStart(2, "0")}`;

      results.push({
        id: `imported-${Date.now()}-${idx}`,
        spaceCode,
        suiteNumber: suite,
        buildingCode: tower,
        floorNumber: floorNum,
        spaceType,
        chargeableArea: chgArea,
        carpetArea: cptArea,
        askingRate,
        seatCapacity: seats,
        fitoutCondition: fitout,
        status
      });
    });

    return results;
  }, [csvDataRows, csvHeaders, columnMapping, towers, defaultTowerCode, defaultTargetRent, propertyCode, currentUnitCount]);

  // Validation metrics
  const validationSummary = useMemo(() => {
    const total = mappedUnits.length;
    const invalidAreaCount = mappedUnits.filter(u => u.chargeableArea <= 0).length;
    const missingSuiteCount = mappedUnits.filter(u => !u.suiteNumber).length;
    const validCount = total - invalidAreaCount - missingSuiteCount;

    const totalSuperArea = mappedUnits.reduce((acc, u) => acc + (u.chargeableArea > 0 ? u.chargeableArea : 0), 0);
    const totalCarpetArea = mappedUnits.reduce((acc, u) => acc + (u.carpetArea > 0 ? u.carpetArea : 0), 0);
    const avgRate = validCount > 0
      ? Math.round(mappedUnits.reduce((acc, u) => acc + u.askingRate, 0) / total)
      : 0;

    return {
      total,
      validCount,
      invalidAreaCount,
      missingSuiteCount,
      totalSuperArea,
      totalCarpetArea,
      avgRate
    };
  }, [mappedUnits]);

  // Execute Final Import
  const handleExecuteImport = () => {
    const validUnits = mappedUnits.filter(u => u.chargeableArea > 0 && u.suiteNumber);
    if (validUnits.length === 0) {
      setErrorMsg("No valid units with positive Chargeable Area found. Please map the 'Chargeable Super Area' column.");
      return;
    }

    onImport(validUnits);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* ── MODAL HEADER ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/40 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center shadow-xs">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Bulk Import Leasable Space Units</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100/70 text-teal-800">
                  Step {modalStep} of 3
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {modalStep === 1 && "Upload CSV / Excel file or paste data with pre-configured templates"}
                {modalStep === 2 && "Match spreadsheet columns to OfficeX institutional space inventory fields"}
                {modalStep === 3 && "Verify parsed inventory metrics and finalize addition to floor schedule"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── STEP PROGRESS BREADCRUMB ── */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-6 font-bold">
            <button
              type="button"
              onClick={() => setModalStep(1)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                modalStep === 1 ? "text-[#0F8B7D] font-black" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                modalStep === 1 ? "bg-[#0F8B7D] text-white" : "bg-slate-200 text-slate-700"
              }`}>1</span>
              <span>1. Upload &amp; Template</span>
            </button>

            <span className="text-slate-300">/</span>

            <button
              type="button"
              disabled={csvHeaders.length === 0}
              onClick={() => csvHeaders.length > 0 && setModalStep(2)}
              className={`flex items-center gap-1.5 transition-colors ${
                modalStep === 2
                  ? "text-[#0F8B7D] font-black"
                  : csvHeaders.length > 0
                  ? "text-slate-500 hover:text-slate-800 cursor-pointer"
                  : "text-slate-300 cursor-not-allowed"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                modalStep === 2 ? "bg-[#0F8B7D] text-white" : "bg-slate-200 text-slate-700"
              }`}>2</span>
              <span>2. Column Mapping</span>
            </button>

            <span className="text-slate-300">/</span>

            <button
              type="button"
              disabled={csvHeaders.length === 0}
              onClick={() => csvHeaders.length > 0 && setModalStep(3)}
              className={`flex items-center gap-1.5 transition-colors ${
                modalStep === 3
                  ? "text-[#0F8B7D] font-black"
                  : csvHeaders.length > 0
                  ? "text-slate-500 hover:text-slate-800 cursor-pointer"
                  : "text-slate-300 cursor-not-allowed"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                modalStep === 3 ? "bg-[#0F8B7D] text-white" : "bg-slate-200 text-slate-700"
              }`}>3</span>
              <span>3. Preview &amp; Import</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1 text-[11px] font-bold text-[#0F8B7D] bg-teal-50 border border-teal-200 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* ── MODAL BODY CONTENT ── */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: UPLOAD OR PASTE + TEMPLATE CHEAT SHEET
             ══════════════════════════════════════════════════════════════════ */}
          {modalStep === 1 && (
            <div className="space-y-5">
              
              {/* Template Action Header Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#0F8B7D]" />
                      Official OfficeX Space Inventory Template
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Download our pre-structured template or copy the headers to format your spreadsheet before importing.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySampleHeaders}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedTemplate ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Headers</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Download size={13} />
                      <span>Download .CSV</span>
                    </button>
                  </div>
                </div>

                {/* Specification Guide Accordion Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSpecGuide(!showSpecGuide)}
                    className="text-[11px] font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Info size={13} />
                    <span>{showSpecGuide ? "Hide Header Field Specification" : "View Detailed Header Specification & Accepted Formats"}</span>
                    {showSpecGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {showSpecGuide && (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                          <tr>
                            <th className="px-3 py-2">Column Header</th>
                            <th className="px-3 py-2">Mandatory?</th>
                            <th className="px-3 py-2">Accepted Values / Format</th>
                            <th className="px-3 py-2">Sample Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                          {TARGET_FIELDS.map(f => (
                            <tr key={f.key} className="hover:bg-slate-50/50">
                              <td className="px-3 py-2 font-bold text-slate-900">
                                {f.label}
                              </td>
                              <td className="px-3 py-2">
                                {f.required ? (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[9px] uppercase">
                                    Required
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px]">
                                    Optional
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-500 font-mono text-[10px]">
                                {f.description}
                              </td>
                              <td className="px-3 py-2 font-mono text-[10px] text-teal-700 font-bold">
                                {f.exampleValue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Mode Selector Tabs: Upload File vs Paste Text */}
              <div className="space-y-3">
                <div className="flex border-b border-slate-200 gap-6">
                  <button
                    type="button"
                    onClick={() => setInputMode("file")}
                    className={`pb-2 text-xs font-black border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      inputMode === "file"
                        ? "border-[#0F8B7D] text-[#0F8B7D]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <UploadCloud size={15} />
                    <span>Upload CSV / Excel File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode("paste")}
                    className={`pb-2 text-xs font-black border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      inputMode === "paste"
                        ? "border-[#0F8B7D] text-[#0F8B7D]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileUp size={15} />
                    <span>Paste Raw Text / Spreadsheet</span>
                  </button>
                </div>

                {/* Option A: Drag & Drop File Upload */}
                {inputMode === "file" && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-300 hover:border-[#0F8B7D] rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 hover:bg-teal-50/20 transition-all flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .tsv, .txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center mb-3">
                      <UploadCloud size={28} />
                    </div>

                    {uploadedFileName ? (
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 font-bold text-xs">
                          <CheckCircle2 size={14} className="text-teal-700" />
                          <span>{uploadedFileName}</span>
                          <span className="text-teal-600 font-mono text-[10px]">({uploadedFileSize})</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          File loaded successfully! Click &ldquo;Continue to Column Mapping&rdquo; below or select a different file.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">
                          Click to select a CSV / spreadsheet file, or drag and drop here
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports comma-separated (.csv), tab-delimited (.tsv), or exported Excel records
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Option B: Direct CSV / Excel Paste */}
                {inputMode === "paste" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-700">Paste Comma or Tab-Separated Rows:</label>
                      <button
                        type="button"
                        onClick={handleInsertSampleRows}
                        className="text-[#0F8B7D] hover:underline font-bold text-[11px] cursor-pointer"
                      >
                        + Insert 6 Sample Office/Retail Units
                      </button>
                    </div>

                    <textarea
                      rows={7}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder={`Suite / Unit ID, Tower, Floor, Space Type, Super Area, Carpet Area, Asking Rate\nSuite 101, T1, 1, office, 5000, 3750, 150\nSuite 102, T1, 1, retail, 2500, 1875, 220\nFloor 2, T1, 2, office, 10000, 7500, 150`}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-mono font-medium text-slate-900 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2: SMART COLUMN MAPPING
             ══════════════════════════════════════════════════════════════════ */}
          {modalStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 text-teal-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0F8B7D] shrink-0" />
                  <span>
                    Detected <strong>{csvHeaders.length} columns</strong> and <strong>{csvDataRows.length} rows</strong>. Verify each field mapping below:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const reset: Record<string, string> = {};
                    TARGET_FIELDS.forEach(f => {
                      const match = csvHeaders.find(h => f.aliases.test(h.toLowerCase().trim()));
                      reset[f.key] = match || "";
                    });
                    setColumnMapping(reset);
                  }}
                  className="text-xs font-bold text-teal-800 hover:underline cursor-pointer"
                >
                  Auto-Detect Again
                </button>
              </div>

              {/* Column Mapping Grid */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-[11px] font-bold text-slate-600">
                  <div className="col-span-5">OfficeX Property Field</div>
                  <div className="col-span-4">Matched Column in Your File</div>
                  <div className="col-span-3 text-right">Sample Value (Row 1)</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                  {TARGET_FIELDS.map((field) => {
                    const currentMapped = columnMapping[field.key] || "";
                    const colIdx = csvHeaders.indexOf(currentMapped);
                    const sampleVal = colIdx !== -1 && csvDataRows[0] ? csvDataRows[0][colIdx] : "";

                    return (
                      <div key={field.key} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-slate-50/50 transition-colors">
                        <div className="col-span-5 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{field.label}</span>
                            {field.required ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                                Required
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{field.description}</p>
                        </div>

                        <div className="col-span-4">
                          <select
                            value={currentMapped}
                            onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                            className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all focus:outline-none ${
                              currentMapped
                                ? "border-[#0F8B7D] bg-teal-50/30 text-teal-900"
                                : field.required
                                ? "border-amber-300 bg-amber-50/30 text-amber-900"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            <option value="">
                              {field.required ? "⚠️ Select matching column..." : "— (Use Default / Unmapped) —"}
                            </option>
                            {csvHeaders.map((header) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3 text-right">
                          {currentMapped ? (
                            <span className="inline-block max-w-full font-mono text-[11px] font-bold text-slate-700 truncate bg-slate-100 px-2 py-0.5 rounded">
                              {sampleVal || "—"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              {field.defaultValueText}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3: PREVIEW & FINAL IMPORT
             ══════════════════════════════════════════════════════════════════ */}
          {modalStep === 3 && (
            <div className="space-y-4">
              
              {/* Metric Cards Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                  <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Total Units</div>
                  <div className="text-lg font-black text-teal-900 mt-0.5">{validationSummary.validCount} Units</div>
                  <div className="text-[10px] text-teal-600 font-medium">Ready for allocation</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Chargeable Area</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {validationSummary.totalSuperArea.toLocaleString()} {areaLabel}
                  </div>
                  <div className="text-[10px] text-slate-400">Leasable floorplate</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Carpet Area</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {validationSummary.totalCarpetArea.toLocaleString()} {areaLabel}
                  </div>
                  <div className="text-[10px] text-slate-400">Usable carpet area</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg. Asking Rent</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    ₹{validationSummary.avgRate}/{areaLabel === "sqm" ? "sqm" : "sqft"}
                  </div>
                  <div className="text-[10px] text-slate-400">Projected rent rate</div>
                </div>
              </div>

              {/* Validation Warning Alert if any row has issues */}
              {validationSummary.invalidAreaCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span>
                    Warning: <strong>{validationSummary.invalidAreaCount} rows</strong> have missing or 0 Chargeable Area and will be skipped.
                  </span>
                </div>
              )}

              {/* High-density preview table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Previewing First {Math.min(mappedUnits.length, 8)} of {mappedUnits.length} Units:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Space Code auto-generated on import
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <tr>
                        <th className="px-3 py-2">Suite / ID</th>
                        <th className="px-3 py-2">Tower</th>
                        <th className="px-3 py-2">Floor</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2 text-right">Super Area</th>
                        <th className="px-3 py-2 text-right">Carpet Area</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2">Fitout</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {mappedUnits.slice(0, 8).map((unit, idx) => (
                        <tr key={unit.id} className={unit.chargeableArea <= 0 ? "bg-rose-50/50" : "hover:bg-slate-50/50"}>
                          <td className="px-3 py-2 font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded bg-teal-50 border border-teal-200 text-[#0F8B7D] font-mono text-[9px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span>{unit.suiteNumber}</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{unit.buildingCode}</td>
                          <td className="px-3 py-2 font-mono text-[11px]">Fl. {unit.floorNumber}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                              {unit.spaceType.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                            {unit.chargeableArea > 0 ? unit.chargeableArea.toLocaleString() : (
                              <span className="text-rose-600 font-bold">0 (Invalid)</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600">
                            {unit.carpetArea.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-700 font-bold">
                            ₹{unit.askingRate}
                          </td>
                          <td className="px-3 py-2 capitalize text-[10px] text-slate-500">
                            {unit.fitoutCondition.replace("_", " ")}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 uppercase">
                              {unit.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── MODAL FOOTER CONTROLS ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div>
            {modalStep > 1 ? (
              <button
                type="button"
                onClick={() => setModalStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {modalStep === 1 && (
              <button
                type="button"
                onClick={handleProceedToMapping}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>Continue to Column Mapping</span>
                <ArrowRight size={14} />
              </button>
            )}

            {modalStep === 2 && (
              <button
                type="button"
                onClick={() => {
                  if (!columnMapping.chargeableArea) {
                    setErrorMsg("Please map the 'Chargeable Super Area' column before proceeding.");
                    return;
                  }
                  setErrorMsg("");
                  setModalStep(3);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>Review &amp; Validate Inventory</span>
                <ArrowRight size={14} />
              </button>
            )}

            {modalStep === 3 && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={validationSummary.validCount === 0}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Import {validationSummary.validCount} Units into Floor Inventory</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

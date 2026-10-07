/**
 * OFFICEX Rent Roll — File Profiler & Column Detection (§4.15, RR-IMP-01/02)
 * Parses Excel / CSV files, skips header/totals fluff, detects columns with synonyms,
 * and generates 10-row preview.
 */

import * as XLSX from "xlsx";

export interface ColumnSuggestion {
  sourceHeader: string;
  suggestedTarget: string | null;
  confidence: number; // 0 to 1
  sampleValues: any[];
}

export interface ProfileResult {
  totalRowsFound: number;
  dataRowsCount: number;
  headers: string[];
  columnSuggestions: ColumnSuggestion[];
  previewRows: Record<string, any>[];
  skippedRowsCount: number;
  qualityWarnings: string[];
}

export const STANDARD_FIELDS: Record<string, { label: string; synonyms: string[]; required?: boolean }> = {
  space_code: {
    label: "Space / Unit Code",
    synonyms: ["space", "unit", "suite", "premises", "office no", "space code", "unit no", "premise code", "demised premises"],
    required: true,
  },
  occupant_name: {
    label: "Tenant / Occupant Name",
    synonyms: ["tenant", "occupant", "client", "company", "lessee", "licensee", "customer", "party", "tenant name", "occupant name"],
    required: true,
  },
  chargeable_area_sqft: {
    label: "Area (Chargeable / Super Area)",
    synonyms: ["super area", "sba", "chargeable area", "area", "size", "leasable area", "carpet area", "area (sq ft)", "area (sq m)", "sqft", "sqm"],
    required: true,
  },
  monthly_rent: {
    label: "Monthly Base Rent",
    synonyms: ["rent", "base rent", "monthly rent", "monthly base rent", "rent amount", "rate", "rental", "base rate", "gross rent"],
    required: true,
  },
  start_date: {
    label: "Start Date",
    synonyms: ["start date", "lease start", "commencement date", "start", "from date", "agreement date", "commencement"],
    required: true,
  },
  end_date: {
    label: "End / Expiry Date",
    synonyms: ["end date", "lease end", "expiry date", "expiry", "to date", "termination date", "expiration"],
    required: true,
  },
  escalation_phrase: {
    label: "Escalation Rate / Terms",
    synonyms: ["escalation", "escalation rate", "rent escalation", "step up", "annual escalation", "escalation %", "escalation terms"],
  },
  deposit_amount: {
    label: "Security Deposit Amount",
    synonyms: ["deposit", "security deposit", "deposit amount", "sd", "security deposit (inr)", "deposit (inr)"],
  },
  property_name: {
    label: "Property / Asset Name",
    synonyms: ["property", "asset", "complex", "property name", "asset name", "project"],
  },
  building_name: {
    label: "Building / Tower Name",
    synonyms: ["building", "tower", "block", "wing", "building name", "tower name"],
  },
  floor_name: {
    label: "Floor / Level",
    synonyms: ["floor", "floor no", "level", "floor name"],
  },
  contract_type: {
    label: "Contract Type",
    synonyms: ["contract type", "agreement type", "lease type", "type"],
  },
  occupancy_status: {
    label: "Status",
    synonyms: ["status", "occupancy status", "lease status"],
  },
};

/**
 * Profiles buffer (Excel or CSV), auto-detects headers, matches synonyms, and returns preview.
 */
export function profileFile(fileBuffer: Buffer, fileName: string): {
  data: Record<string, any>[];
  profile: ProfileResult;
} {
  const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to 2D array of raw values to accurately inspect header & totals rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  const qualityWarnings: string[] = [];

  if (!rawRows || rawRows.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  // 1. Detect header row: skip blank or single-cell title rows
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i];
    const nonEmptyCells = row.filter((c) => String(c).trim() !== "");
    if (nonEmptyCells.length >= 3) {
      headerRowIndex = i;
      break;
    }
  }

  const rawHeaders: string[] = rawRows[headerRowIndex].map((h: any) => String(h).trim());
  const cleanHeaders = rawHeaders.filter((h) => h.length > 0);

  if (cleanHeaders.length === 0) {
    throw new Error("Could not detect valid column headers in the uploaded file.");
  }

  // 2. Filter data rows and strip totals row
  let skippedRowsCount = headerRowIndex;
  const rawDataRows = rawRows.slice(headerRowIndex + 1);

  const cleanData: Record<string, any>[] = [];

  for (let rowIndex = 0; rowIndex < rawDataRows.length; rowIndex++) {
    const row = rawDataRows[rowIndex];
    const isBlank = row.every((c) => String(c).trim() === "");
    if (isBlank) {
      skippedRowsCount++;
      continue;
    }

    // Check if totals row: first cell or any cell says "Total" / "Grand Total" / "Sum"
    const isTotalsRow = row.some((c) => {
      const val = String(c).trim().toLowerCase();
      return val === "total" || val === "grand total" || val === "totals" || val === "sum";
    });

    if (isTotalsRow) {
      skippedRowsCount++;
      qualityWarnings.push(`Row ${headerRowIndex + rowIndex + 2} detected as a Totals row and excluded from data rows.`);
      continue;
    }

    const rowObj: Record<string, any> = {};
    for (let c = 0; c < rawHeaders.length; c++) {
      const header = rawHeaders[c];
      if (header) {
        rowObj[header] = row[c] ?? "";
      }
    }
    cleanData.push(rowObj);
  }

  // 3. Match column suggestions with ML-style fuzzy/synonym matching
  const columnSuggestions: ColumnSuggestion[] = cleanHeaders.map((header) => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
    let bestMatch: string | null = null;
    let highestScore = 0;

    for (const [targetKey, config] of Object.entries(STANDARD_FIELDS)) {
      // Direct key match
      if (normalizedHeader === targetKey || normalizedHeader === targetKey.replace(/_/g, " ")) {
        bestMatch = targetKey;
        highestScore = 1.0;
        break;
      }

      // Synonym match
      for (const syn of config.synonyms) {
        const normSyn = syn.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
        if (normalizedHeader === normSyn) {
          bestMatch = targetKey;
          highestScore = 0.95;
          break;
        } else if (normalizedHeader.includes(normSyn) || normSyn.includes(normalizedHeader)) {
          const score = 0.8;
          if (score > highestScore) {
            highestScore = score;
            bestMatch = targetKey;
          }
        }
      }
    }

    const sampleValues = cleanData.slice(0, 5).map((r) => r[header]);

    return {
      sourceHeader: header,
      suggestedTarget: highestScore >= 0.7 ? bestMatch : null,
      confidence: highestScore,
      sampleValues,
    };
  });

  const previewRows = cleanData.slice(0, 10);

  return {
    data: cleanData,
    profile: {
      totalRowsFound: rawRows.length,
      dataRowsCount: cleanData.length,
      headers: cleanHeaders,
      columnSuggestions,
      previewRows,
      skippedRowsCount,
      qualityWarnings,
    },
  };
}

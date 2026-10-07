/**
 * OFFICEX Rent Roll — Transform Rules Engine (§13.4, RR-IMP-03)
 * Handles:
 * - Indian number parsing (10,00,000 / 10.00.000)
 * - Auto-detect date formats (DD-MM-YYYY, DD-MMM-YYYY, YYYY-MM-DD)
 * - Area unit conversion (sq m -> sq ft @ 10.764)
 * - Enum mapping (status, contract_type, direction)
 * - Escalation phrase parsing ("5% pa", "5 percent per annum", etc.)
 */

export interface DateParseResult {
  isoDate: string | null;
  formatDetected: string | null;
  isAmbiguous: boolean;
}

export interface EscalationParseResult {
  escalation_type: "percentage" | "fixed_amount" | "index_based" | "stepped_schedule" | null;
  escalation_value: number | null;
  index_name?: string;
  raw_phrase: string;
}

/**
 * 1. Parse Indian numbers with comma or period thousand-separators
 * Examples: "10,00,000" -> 1000000, "10.00.000" -> 1000000, "₹ 1,50,000.50" -> 150000.50
 */
export function parseIndianNumber(val: any): number | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;

  let str = String(val).trim();
  // Strip currency symbols and letters
  str = str.replace(/[₹$€£RsINR,\s]/gi, "");

  // Check for Indian period grouping if there are multiple dots (e.g. "10.00.000")
  const dotCount = (str.match(/\./g) || []).length;
  if (dotCount > 1) {
    // Treat dots as thousand separators
    str = str.replace(/\./g, "");
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * 2. Auto-detect and parse date formats (DD-MM-YYYY, DD-MMM-YYYY, YYYY-MM-DD)
 */
export function parseImportDate(val: any): DateParseResult {
  if (!val) return { isoDate: null, formatDetected: null, isAmbiguous: false };

  // Handle Excel serial date numbers (e.g., 45300)
  if (typeof val === "number" || (!isNaN(Number(val)) && Number(val) > 20000 && Number(val) < 80000)) {
    const excelSerial = Number(val);
    const dateObj = new Date((excelSerial - 25569) * 86400 * 1000);
    if (!isNaN(dateObj.getTime())) {
      return {
        isoDate: dateObj.toISOString().split("T")[0],
        formatDetected: "EXCEL_SERIAL",
        isAmbiguous: false,
      };
    }
  }

  const str = String(val).trim();

  // Pattern 1: ISO YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return {
        isoDate: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        formatDetected: "YYYY-MM-DD",
        isAmbiguous: false,
      };
    }
  }

  // Pattern 2: DD-MMM-YYYY (e.g., 01-Jan-2025, 25-Dec-2024, 15/Mar/2026)
  const monthNames: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  const dmmmyMatch = str.match(/^(\d{1,2})[-/.\s]([A-Za-z]{3,9})[-/.\s](\d{4})$/);
  if (dmmmyMatch) {
    const d = parseInt(dmmmyMatch[1], 10);
    const mStr = dmmmyMatch[2].slice(0, 3).toLowerCase();
    const y = parseInt(dmmmyMatch[3], 10);
    const m = monthNames[mStr];
    if (m && d >= 1 && d <= 31) {
      return {
        isoDate: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        formatDetected: "DD-MMM-YYYY",
        isAmbiguous: false,
      };
    }
  }

  // Pattern 3: DD-MM-YYYY or MM-DD-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const first = parseInt(dmyMatch[1], 10);
    const second = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);

    // If first > 12, it must be DD-MM-YYYY
    if (first > 12 && second <= 12) {
      return {
        isoDate: `${y}-${String(second).padStart(2, "0")}-${String(first).padStart(2, "0")}`,
        formatDetected: "DD-MM-YYYY",
        isAmbiguous: false,
      };
    }

    // If second > 12, it must be MM-DD-YYYY
    if (second > 12 && first <= 12) {
      return {
        isoDate: `${y}-${String(first).padStart(2, "0")}-${String(second).padStart(2, "0")}`,
        formatDetected: "MM-DD-YYYY",
        isAmbiguous: false,
      };
    }

    // If both <= 12, it is ambiguous! Default to standard Indian DD-MM-YYYY and flag
    return {
      isoDate: `${y}-${String(second).padStart(2, "0")}-${String(first).padStart(2, "0")}`,
      formatDetected: "DD-MM-YYYY",
      isAmbiguous: true,
    };
  }

  // Attempt standard JS Date parse as fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return {
      isoDate: parsed.toISOString().split("T")[0],
      formatDetected: "JS_PARSED",
      isAmbiguous: true,
    };
  }

  return { isoDate: null, formatDetected: null, isAmbiguous: false };
}

/**
 * 3. Unit conversion (sq m -> sq ft @ 10.764)
 */
export function convertAreaToSqft(val: any, columnNameOrUnit?: string): number | null {
  const num = parseIndianNumber(val);
  if (num === null) return null;

  const hint = (columnNameOrUnit || "").toLowerCase();
  if (hint.includes("sq m") || hint.includes("sqm") || hint.includes("sq.m") || hint.includes("square meter")) {
    return Math.round(num * 10.764 * 100) / 100;
  }

  return num;
}

/**
 * 4. Text to enum conversion
 */
export function parseOccupancyStatus(val: any): "vacant" | "occupied" | "under_maintenance" | "retired" {
  if (!val) return "vacant";
  const s = String(val).trim().toLowerCase();
  if (s.includes("occup") || s.includes("let out") || s.includes("leased") || s.includes("active") || s.includes("rented")) {
    return "occupied";
  }
  if (s.includes("maint") || s.includes("fitout") || s.includes("fit out")) {
    return "under_maintenance";
  }
  if (s.includes("retire") || s.includes("blocked")) {
    return "retired";
  }
  return "vacant";
}

export function parseContractType(val: any): "lease" | "leave_and_licence" | "managed_office_agreement" | "co_working_membership" {
  if (!val) return "lease";
  const s = String(val).trim().toLowerCase();
  if (s.includes("licence") || s.includes("license") || s.includes("l&l") || s.includes("l & l")) {
    return "leave_and_licence";
  }
  if (s.includes("cowork") || s.includes("co-work") || s.includes("member") || s.includes("flex")) {
    return "co_working_membership";
  }
  if (s.includes("managed") || s.includes("enterprise") || s.includes("serviced")) {
    return "managed_office_agreement";
  }
  return "lease";
}

export function parseDirectionEnum(val: any): "payable" | "receivable" {
  if (!val) return "receivable";
  const s = String(val).trim().toLowerCase();
  if (s.includes("pay") || s.includes("expense") || s.includes("reverse") || s.includes("outflow")) {
    return "payable";
  }
  return "receivable";
}

/**
 * 5. Escalation phrase parsing
 * "5% pa" -> { type: 'percentage', value: 5 }
 * "5 percent per annum" -> { type: 'percentage', value: 5 }
 * "$50000 yearly" -> { type: 'fixed_amount', value: 50000 }
 * "CPI indexed" -> { type: 'index_based', index_name: 'cpi' }
 */
export function parseEscalationPhrase(val: any): EscalationParseResult {
  const raw = String(val || "").trim();
  if (!raw) {
    return { escalation_type: null, escalation_value: null, raw_phrase: "" };
  }

  // Percentage pattern: "5%", "5 % pa", "5 percent per annum", "5.5% annual"
  const pctMatch = raw.match(/([\d.]+)\s*(%|percent)\s*(pa|p\.a\.|per annum|annual|yearly)?/i);
  if (pctMatch) {
    const value = parseFloat(pctMatch[1]);
    return {
      escalation_type: "percentage",
      escalation_value: isNaN(value) ? null : value,
      raw_phrase: raw,
    };
  }

  // CPI index pattern: "CPI", "CPI indexed", "Inflation indexed"
  if (/cpi|inflation|index/i.test(raw)) {
    return {
      escalation_type: "index_based",
      escalation_value: null,
      index_name: /cpi/i.test(raw) ? "cpi" : "inflation",
      raw_phrase: raw,
    };
  }

  // Fixed amount pattern: "50000 yearly", "₹50,000 pa", "$50000 annual"
  const fixedMatch = raw.match(/[₹$€£Rs\s]*([\d,.]+)\s*(yearly|annual|pa|p\.a\.|per annum)/i);
  if (fixedMatch) {
    const value = parseIndianNumber(fixedMatch[1]);
    return {
      escalation_type: "fixed_amount",
      escalation_value: value,
      raw_phrase: raw,
    };
  }

  // If simple numeric string e.g. "5"
  const rawNum = parseIndianNumber(raw);
  if (rawNum !== null) {
    if (rawNum <= 50) {
      // Typically percentages if <= 50
      return { escalation_type: "percentage", escalation_value: rawNum, raw_phrase: raw };
    }
    return { escalation_type: "fixed_amount", escalation_value: rawNum, raw_phrase: raw };
  }

  return { escalation_type: null, escalation_value: null, raw_phrase: raw };
}

/**
 * OFFICEX Rent Roll — Excel Error File Generator (§4.15, RR-IMP-09)
 * Generates an Excel spreadsheet containing failed rows, specific validation messages,
 * and fix suggestions for offline remediation.
 */

import * as XLSX from "xlsx";

export interface FailedRowExportItem {
  source_row_num: number;
  source_row_json: Record<string, any>;
  validation_errors: Array<{
    field: string;
    expected: string;
    actual: string;
    message: string;
  }>;
}

export function generateErrorWorkbook(failedRows: FailedRowExportItem[]): Buffer {
  const exportRows = failedRows.map((r) => {
    const errorSummary = r.validation_errors.map((e) => `[${e.field}] ${e.message}`).join("; ");
    const expectedSummary = r.validation_errors.map((e) => `[${e.field}] Expected: ${e.expected}`).join("; ");
    const actualSummary = r.validation_errors.map((e) => `[${e.field}] Actual: ${e.actual}`).join("; ");
    const fixSuggestion = r.validation_errors
      .map((e) => {
        if (e.field === "dates") return "Format dates as DD-MM-YYYY (e.g., 01-01-2025).";
        if (e.field === "end_date") return "Ensure lease end date is later than start date.";
        if (e.field === "chargeable_area_sqft") return "Enter a positive numeric area in sq ft.";
        if (e.field === "monthly_rent") return "Enter valid non-negative rent amount.";
        return `Please correct the value in '${e.field}'.`;
      })
      .join(" ");

    return {
      "Row Number": r.source_row_num,
      "Validation Errors": errorSummary,
      "Expected Format": expectedSummary,
      "Actual Received": actualSummary,
      "Remediation / Fix Suggestion": fixSuggestion,
      ...r.source_row_json,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  // Auto-width columns for cleaner presentation
  const colWidths = [
    { wch: 12 }, // Row Number
    { wch: 40 }, // Errors
    { wch: 30 }, // Expected
    { wch: 25 }, // Actual
    { wch: 45 }, // Suggestion
  ];
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Records");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

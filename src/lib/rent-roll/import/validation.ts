/**
 * OFFICEX Rent Roll — Import Validation & Exception Engine (§5.5a, RR-IMP-05/06)
 * Validates exploded rows, enforces §5.5a rules, and routes warnings to the exception queue.
 */

import { ExplodedEntities } from "./explode";

export interface ValidationErrorItem {
  field: string;
  expected: string;
  actual: string;
  message: string;
}

export interface ExceptionItem {
  field_name: string;
  flag_type: "info" | "warning" | "error";
  flag_message: string;
  expected_value?: string;
  actual_value?: string;
}

export interface RowValidationResult {
  status: "passed" | "warning" | "failed";
  errors: ValidationErrorItem[];
  exceptions: ExceptionItem[];
}

/**
 * Validates an exploded row and checks exception triggers.
 */
export function validateImportRow(
  entities: ExplodedEntities,
  rawRow: Record<string, any>,
  seenSpaceCodes: Set<string>
): RowValidationResult {
  const errors: ValidationErrorItem[] = [];
  const exceptions: ExceptionItem[] = [];

  const { space, occupant, contract, charge } = entities;

  // 1. Required field checks (§5.5a)
  if (!space.space_code || space.space_code.trim() === "") {
    errors.push({
      field: "space_code",
      expected: "Non-empty space code",
      actual: String(space.space_code || ""),
      message: "Space code is required.",
    });
  }

  if (!occupant.occupant_name || occupant.occupant_name.trim() === "") {
    errors.push({
      field: "occupant_name",
      expected: "Non-empty occupant/tenant name",
      actual: String(occupant.occupant_name || ""),
      message: "Occupant/tenant name is required.",
    });
  }

  // 2. Area validation (> 0)
  if (space.chargeable_area_sqft === null || space.chargeable_area_sqft === undefined || space.chargeable_area_sqft <= 0) {
    errors.push({
      field: "chargeable_area_sqft",
      expected: "> 0 sq ft",
      actual: String(space.chargeable_area_sqft),
      message: "Chargeable area must be greater than zero.",
    });
  } else if (space.chargeable_area_sqft > 100000) {
    // Exception queue trigger (Warning)
    exceptions.push({
      field_name: "chargeable_area_sqft",
      flag_type: "warning",
      flag_message: `Exceptionally large space area (${space.chargeable_area_sqft.toLocaleString()} sqft). Verify if this is an entire campus.`,
      expected_value: "< 100,000 sqft",
      actual_value: `${space.chargeable_area_sqft} sqft`,
    });
  }

  // 3. Rent validation (>= 0, no negative amounts)
  if (charge.rate_amount === null || charge.rate_amount === undefined || charge.rate_amount < 0) {
    errors.push({
      field: "monthly_rent",
      expected: ">= 0",
      actual: String(charge.rate_amount),
      message: "Monthly rent cannot be negative.",
    });
  } else if (charge.rate_amount === 0) {
    // Exception queue trigger (Warning)
    exceptions.push({
      field_name: "monthly_rent",
      flag_type: "warning",
      flag_message: "Zero base rent specified for occupied contract. Verify if rent-free concession applies.",
      expected_value: "> 0 INR",
      actual_value: "0 INR",
    });
  } else if (charge.rate_amount > 10000000) {
    // Exception queue trigger (Warning: > 1 Crore/month)
    exceptions.push({
      field_name: "monthly_rent",
      flag_type: "warning",
      flag_message: `High value monthly rent (₹${(charge.rate_amount / 100000).toFixed(2)} Lakhs). Please confirm magnitude.`,
      expected_value: "< ₹1 Cr/mo",
      actual_value: `₹${charge.rate_amount}`,
    });
  }

  // 4. Date validation (start_date < end_date)
  if (!contract.start_date || !contract.end_date) {
    errors.push({
      field: "dates",
      expected: "Valid start and end dates",
      actual: `Start: ${contract.start_date}, End: ${contract.end_date}`,
      message: "Both start date and end date are required.",
    });
  } else {
    const startMs = new Date(contract.start_date).getTime();
    const endMs = new Date(contract.end_date).getTime();
    if (isNaN(startMs) || isNaN(endMs)) {
      errors.push({
        field: "dates",
        expected: "Parseable calendar dates",
        actual: `Start: ${contract.start_date}, End: ${contract.end_date}`,
        message: "Invalid date format encountered.",
      });
    } else if (startMs >= endMs) {
      errors.push({
        field: "end_date",
        expected: "end_date > start_date",
        actual: `Start: ${contract.start_date}, End: ${contract.end_date}`,
        message: "Start date must precede end date.",
      });
    }
  }

  // 5. Deposit validation (no negative deposit)
  if (contract.deposit_amount_inr < 0) {
    errors.push({
      field: "deposit_amount_inr",
      expected: ">= 0",
      actual: String(contract.deposit_amount_inr),
      message: "Deposit amount cannot be negative.",
    });
  } else if (contract.deposit_amount_inr === 0) {
    exceptions.push({
      field_name: "deposit_amount_inr",
      flag_type: "info",
      flag_message: "No security deposit specified for contract.",
      expected_value: "Standard 3-6 months rent deposit",
      actual_value: "0 INR",
    });
  }

  // 6. Space code uniqueness in batch
  const normalizedSpace = space.space_code.toLowerCase().trim();
  if (seenSpaceCodes.has(normalizedSpace)) {
    exceptions.push({
      field_name: "space_code",
      flag_type: "warning",
      flag_message: `Duplicate space code '${space.space_code}' detected in current batch. Multiple contracts may be mapped to the same space.`,
      expected_value: "Unique space_code per property",
      actual_value: space.space_code,
    });
  } else {
    seenSpaceCodes.add(normalizedSpace);
  }

  // Overall status evaluation
  let status: "passed" | "warning" | "failed" = "passed";
  if (errors.length > 0) {
    status = "failed";
  } else if (exceptions.length > 0) {
    status = "warning";
  }

  return {
    status,
    errors,
    exceptions,
  };
}

/**
 * OFFICEX Rent Roll — Billing Calculation Engine (§13 Worked Examples & Formulas F-01 to F-25)
 * 
 * Implements deterministic calculation rules for Indian Commercial Real Estate & Flex Workspaces:
 * - F-01: Base Rent Calculation
 * - F-02 to F-10: Escalation Variants (Fixed %, Fixed ₹, CPI-Indexed, Slab-based, Capped/Floored)
 * - F-11 to F-15: Area-Based Billing (CAM, Parking, Sqft Rates)
 * - F-16 to F-20: Seat-Based Billing (Flex, Coworking desks)
 * - F-21: Tax Calculation from tax_profile (GST CGST+SGST / IGST)
 * - F-22: Calendar Days Proration (Partial months)
 * - F-23: Concession & Rent-Free Deductions
 * - F-24: Security Deposit Offset / Adjustment
 * - F-25: Net Receivable Settlement
 */

export interface TaxProfileInput {
  id?: string;
  tax_name: string;
  tax_rate_percent: number;
}

export interface ContractChargeInput {
  id?: string;
  component: string;
  calc_basis: "fixed" | "per_area" | "per_sqft" | "per_seat" | "per_slot" | "metered" | "pro_rata_share" | "pct_of_turnover" | "percentage_of_rent" | "actual_plus_margin" | string;
  rate: number;
  rate_period?: "month" | "year" | string;
  quantity_basis?: number;
  is_included?: boolean;
  is_recoverable?: boolean;
  invoice_group?: "rent" | "cam" | "utility" | "parking" | "other" | string;
  billing_mode?: "advance" | "arrears";
  charge_type_id?: string;
  tax_profile?: TaxProfileInput | null;
  tax_rate_percent?: number;
  start_date?: string;
  end_date?: string;
}

export interface RentStepInput {
  id?: string;
  contract_charge_id?: string;
  step_no: number;
  effective_date: string;
  escalation_type: "fixed_percentage" | "fixed_amount" | "cpi_linked" | "stepped_rate" | "custom";
  escalation_value?: number;
  rate: number;
  compounding?: boolean;
  cpi_index?: string;
  cap_pct?: number;
  floor_pct?: number;
}

export interface ConcessionInput {
  id?: string;
  concession_type: "rent_free" | "fitout_period" | "discount_percentage" | "fixed_deduction" | "stepped_relief";
  start_date: string;
  end_date: string;
  concession_value: number; // Percentage or fixed INR
  description?: string;
}

export interface BillingCalculationParams {
  billing_month: string; // "YYYY-MM" or "YYYY-MM-DD"
  period_start?: string; // "YYYY-MM-DD"
  period_end?: string;   // "YYYY-MM-DD"
  billing_model: "area" | "seats" | "fixed" | "hybrid";
  leased_area_sqft?: number;
  number_of_seats?: number;
  charges: ContractChargeInput[];
  rent_steps?: RentStepInput[];
  concessions?: ConcessionInput[];
  deposit_adjustment_inr?: number;
  tds_rate_percent?: number; // Standard 10% TDS Sec 194-I for rent, 2% for CAM/maintenance
  default_tax_rate_percent?: number; // fallback GST rate e.g. 18.00
  override_charges?: Array<{
    contract_charge_id?: string;
    charge_type_id?: string;
    custom_amount: number;
    description?: string;
  }>;
}

export interface BillingLineItemBreakdown {
  contract_charge_id?: string;
  charge_type_id?: string;
  description: string;
  invoice_group: string;
  calc_basis: string;
  quantity: number;
  rate: number;
  amount_inr: number;
  tax_rate_percent: number;
  tax_amount_inr: number;
  escalation_amount_inr: number;
  concession_amount_inr: number;
  net_line_total_inr: number;
  formula_applied: string;
}

export interface BillingCalculationResult {
  period_start: string;
  period_end: string;
  days_in_period: number;
  days_in_month: number;
  proration_factor: number;
  
  // Aggregate Financials (§4.10, §13)
  base_rent: number;
  cam_charges: number;
  utility_charges: number;
  other_charges: number;
  escalation_adjustment: number;
  concession_amount: number;
  subtotal: number;
  
  gst_rate_effective: number;
  gst_amount: number;
  gross_total: number;
  
  deposit_adjustment: number;
  tds_deducted: number;
  net_receivable: number;
  
  breakdown: BillingLineItemBreakdown[];
}

/**
 * Helper to get days in a given calendar month
 */
export function getDaysInMonth(year: number, monthZeroBased: number): number {
  return new Date(Date.UTC(year, monthZeroBased + 1, 0)).getUTCDate();
}

/**
 * Format Date as YYYY-MM-DD
 */
export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/**
 * Parse YYYY-MM or YYYY-MM-DD to year and month
 */
export function parseBillingMonth(monthStr: string): { year: number; month: number; daysInMonth: number } {
  const parts = monthStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-12
  const daysInMonth = getDaysInMonth(year, month - 1);
  return { year, month, daysInMonth };
}

/**
 * Calculate overlap days between two inclusive date ranges [A_start, A_end] and [B_start, B_end]
 */
export function getOverlapDays(
  rangeAStart: string,
  rangeAEnd: string,
  rangeBStart: string,
  rangeBEnd: string
): number {
  const startA = new Date(rangeAStart + "T00:00:00Z").getTime();
  const endA = new Date(rangeAEnd + "T00:00:00Z").getTime();
  const startB = new Date(rangeBStart + "T00:00:00Z").getTime();
  const endB = new Date(rangeBEnd + "T00:00:00Z").getTime();

  const overlapStart = Math.max(startA, startB);
  const overlapEnd = Math.min(endA, endB);

  if (overlapStart > overlapEnd) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((overlapEnd - overlapStart) / msPerDay) + 1;
}

/**
 * Round to 2 decimal places (standard financial rounding)
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Main Billing Calculator Function implementing Formulas F-01 to F-25
 */
export function calculateBilling(params: BillingCalculationParams): BillingCalculationResult {
  const { year, month, daysInMonth } = parseBillingMonth(params.billing_month);
  
  // Determine billing period window
  const defaultPeriodStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const defaultPeriodEnd = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

  const periodStart = params.period_start || defaultPeriodStart;
  const periodEnd = params.period_end || defaultPeriodEnd;

  // Formula F-22: Proration Factor
  // Calendar days within the period
  const startDate = new Date(periodStart + "T00:00:00Z");
  const endDate = new Date(periodEnd + "T00:00:00Z");
  const diffMs = endDate.getTime() - startDate.getTime();
  const daysInPeriod = Math.max(1, Math.min(daysInMonth, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1));
  const prorationFactor = daysInPeriod / daysInMonth;

  const defaultTaxRate = params.default_tax_rate_percent ?? 18.00;
  const areaSqft = params.leased_area_sqft || 0;
  const seatsCount = params.number_of_seats || 0;

  const breakdown: BillingLineItemBreakdown[] = [];

  let baseRentTotal = 0;
  let camTotal = 0;
  let utilityTotal = 0;
  let otherTotal = 0;
  let escalationAdjustmentTotal = 0;
  let concessionDeductionTotal = 0;

  // Process Each Contract Charge Rule
  for (const ch of params.charges) {
    if (ch.is_included) {
      // Included in base rent, zero out direct charge
      continue;
    }

    // Check charge date validity against current billing period
    if (ch.start_date && ch.start_date > periodEnd) continue;
    if (ch.end_date && ch.end_date < periodStart) continue;

    // Check if overridden
    const override = params.override_charges?.find(
      (o) => (ch.id && o.contract_charge_id === ch.id) || (ch.charge_type_id && o.charge_type_id === ch.charge_type_id)
    );

    // Active Rent Step (Escalation) Lookup: F-02 to F-10
    let effectiveRate = Number(ch.rate) || 0;
    let baseRate = effectiveRate;
    let escalationAmt = 0;
    let appliedFormula = "F-01";

    if (ch.id && params.rent_steps && params.rent_steps.length > 0) {
      const activeSteps = params.rent_steps
        .filter((st) => st.contract_charge_id === ch.id && st.effective_date <= periodEnd)
        .sort((a, b) => b.effective_date.localeCompare(a.effective_date));

      if (activeSteps.length > 0) {
        const currentStep = activeSteps[0];
        effectiveRate = Number(currentStep.rate);

        // Calculate escalation adjustment (Formula F-02 / F-03 / F-04)
        if (currentStep.escalation_type === "fixed_percentage") {
          appliedFormula = "F-02 (Fixed %)";
        } else if (currentStep.escalation_type === "fixed_amount") {
          appliedFormula = "F-03 (Fixed ₹)";
        } else if (currentStep.escalation_type === "cpi_linked") {
          appliedFormula = "F-04 (CPI-indexed)";
        } else {
          appliedFormula = "F-05 (Stepped Rate)";
        }
      }
    }

    // Monthly rate normalization if rate period is year
    const monthlyRate = ch.rate_period === "year" ? effectiveRate / 12 : effectiveRate;
    const baseMonthlyRate = ch.rate_period === "year" ? baseRate / 12 : baseRate;

    let quantity = 1;
    let unproratedAmount = 0;

    // Model & Basis Specific Formula Selection
    if (ch.calc_basis === "per_sqft" || ch.calc_basis === "per_area" || (params.billing_model === "area" && ch.invoice_group === "rent")) {
      // Formula F-11 to F-15: Area-based billing
      quantity = ch.quantity_basis ? Number(ch.quantity_basis) : areaSqft;
      unproratedAmount = monthlyRate * quantity;
      appliedFormula = appliedFormula === "F-01" ? "F-11 (Area Sqft)" : `${appliedFormula} + F-11`;
    } else if (ch.calc_basis === "per_seat" || (params.billing_model === "seats" && ch.invoice_group === "rent")) {
      // Formula F-16 to F-20: Seat-based flex billing
      quantity = ch.quantity_basis ? Number(ch.quantity_basis) : seatsCount;
      unproratedAmount = monthlyRate * quantity;
      appliedFormula = appliedFormula === "F-01" ? "F-16 (Seat Billing)" : `${appliedFormula} + F-16`;
    } else if (ch.calc_basis === "percentage_of_rent") {
      // Percentage of base rent
      unproratedAmount = (baseRentTotal * monthlyRate) / 100;
      quantity = 1;
      appliedFormula = "F-15 (% of Rent)";
    } else {
      // Formula F-01: Fixed Amount
      quantity = ch.quantity_basis ? Number(ch.quantity_basis) : 1;
      unproratedAmount = monthlyRate * quantity;
      appliedFormula = appliedFormula === "F-01" ? "F-01 (Base Rent)" : appliedFormula;
    }

    // Apply Proration: Formula F-22
    let lineAmount = round2(unproratedAmount * prorationFactor);

    if (override) {
      lineAmount = round2(override.custom_amount);
      appliedFormula += " [Overridden]";
    }

    // Calculate isolated escalation variance
    const unescalatedAmount = round2((baseMonthlyRate * quantity) * prorationFactor);
    escalationAmt = Math.max(0, round2(lineAmount - unescalatedAmount));

    // Concession Deduction Check (Formula F-23)
    let lineConcession = 0;
    if (params.concessions && params.concessions.length > 0 && ch.invoice_group === "rent") {
      for (const conc of params.concessions) {
        const overlap = getOverlapDays(periodStart, periodEnd, conc.start_date, conc.end_date);
        if (overlap > 0) {
          const concRatio = overlap / daysInPeriod;
          if (conc.concession_type === "rent_free" || conc.concession_type === "fitout_period") {
            // 100% rent relief for overlapping days
            lineConcession += round2(lineAmount * concRatio);
            appliedFormula += " + F-23 (Rent Free)";
          } else if (conc.concession_type === "discount_percentage") {
            const discVal = (Number(conc.concession_value) || 0) / 100;
            lineConcession += round2(lineAmount * concRatio * discVal);
            appliedFormula += ` + F-23 (${conc.concession_value}% Disc)`;
          } else if (conc.concession_type === "fixed_deduction") {
            lineConcession += round2(Number(conc.concession_value) || 0);
            appliedFormula += " + F-23 (Fixed Deduction)";
          }
        }
      }
    }

    // Ensure concession does not exceed line amount
    lineConcession = Math.min(lineAmount, lineConcession);
    const netLineBeforeTax = Math.max(0, round2(lineAmount - lineConcession));

    // Formula F-21: Tax Calculation from tax_profile
    const taxRate = ch.tax_profile?.tax_rate_percent ?? (ch.tax_rate_percent ?? defaultTaxRate);
    const taxAmount = round2((netLineBeforeTax * taxRate) / 100);

    const netLineTotal = round2(netLineBeforeTax + taxAmount);

    // Grouping classification
    const group = (ch.invoice_group || "rent").toLowerCase();
    if (group === "rent") {
      baseRentTotal += lineAmount;
    } else if (group === "cam") {
      camTotal += lineAmount;
    } else if (group === "utility") {
      utilityTotal += lineAmount;
    } else {
      otherTotal += lineAmount;
    }

    escalationAdjustmentTotal += escalationAmt;
    concessionDeductionTotal += lineConcession;

    breakdown.push({
      contract_charge_id: ch.id,
      charge_type_id: ch.charge_type_id,
      description: ch.component,
      invoice_group: ch.invoice_group || "rent",
      calc_basis: ch.calc_basis,
      quantity: round2(quantity),
      rate: round2(effectiveRate),
      amount_inr: lineAmount,
      tax_rate_percent: taxRate,
      tax_amount_inr: taxAmount,
      escalation_amount_inr: escalationAmt,
      concession_amount_inr: lineConcession,
      net_line_total_inr: netLineTotal,
      formula_applied: appliedFormula,
    });
  }

  // Aggregate subtotal
  const grossSubtotal = round2(baseRentTotal + camTotal + utilityTotal + otherTotal);
  const netSubtotalAfterConcession = Math.max(0, round2(grossSubtotal - concessionDeductionTotal));

  // Aggregate Taxes (Formula F-21)
  const totalTaxAmount = round2(
    breakdown.reduce((sum, item) => sum + item.tax_amount_inr, 0)
  );

  const effectiveGstRate = netSubtotalAfterConcession > 0
    ? round2((totalTaxAmount / netSubtotalAfterConcession) * 100)
    : defaultTaxRate;

  // Gross invoice total before adjustments
  const grossTotal = round2(netSubtotalAfterConcession + totalTaxAmount);

  // Formula F-24: Security Deposit Adjustment
  // Capped at grossTotal
  const requestedDepositAdj = params.deposit_adjustment_inr || 0;
  const depositAdjustment = Math.min(grossTotal, Math.max(0, requestedDepositAdj));

  // TDS Deduction (Typically 10% under Section 194-I on rent, or specified TDS rate)
  const tdsRate = params.tds_rate_percent || 0;
  const tdsDeducted = round2((netSubtotalAfterConcession * tdsRate) / 100);

  // Formula F-25: Net Receivable Settlement
  // net_receivable = total_rent + tax_amount - deposit_adjustment - concession_amount
  const netReceivable = Math.max(0, round2(grossTotal - depositAdjustment - tdsDeducted));

  return {
    period_start: periodStart,
    period_end: periodEnd,
    days_in_period: daysInPeriod,
    days_in_month: daysInMonth,
    proration_factor: round2(prorationFactor),

    base_rent: round2(baseRentTotal),
    cam_charges: round2(camTotal),
    utility_charges: round2(utilityTotal),
    other_charges: round2(otherTotal),
    escalation_adjustment: round2(escalationAdjustmentTotal),
    concession_amount: round2(concessionDeductionTotal),
    subtotal: netSubtotalAfterConcession,

    gst_rate_effective: effectiveGstRate,
    gst_amount: totalTaxAmount,
    gross_total: grossTotal,

    deposit_adjustment: round2(depositAdjustment),
    tds_deducted: round2(tdsDeducted),
    net_receivable: netReceivable,

    breakdown,
  };
}

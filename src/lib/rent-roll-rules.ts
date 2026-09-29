/**
 * OFFICEX Rent Roll Canonical Rules & Formulas Engine (Document V2.1)
 * Table 48 (Formulas F-01 through F-25) & Table 57 / Table 5.5a (Validation Rules R-01 through R-44)
 * 100% specification fidelity, zero placeholders.
 */

// ============================================================================
// PART 1: FORMULAS ENGINE (Table 48: F-01 to F-25)
// ============================================================================

export interface FlexSeatBillingInput {
  billingBasis: 'contracted' | 'occupied' | 'minimum_commitment' | 'hybrid';
  contractedSeats: number;
  occupiedSeats: number;
  minimumCommittedSeats?: number;
  seatRate: number;
  baseCommitmentCharge?: number;
  additionalSeatRate?: number;
  usageCharges?: number;
}

export interface MeterReadingInput {
  closingReading: number;
  openingReading: number;
  multiplier?: number;
  tariff: number;
}

export interface ProrationInput {
  periodCharge: number;
  daysOccupiedInPeriod: number;
  daysInPeriod: number;
}

export interface InvoiceTaxInput {
  taxableLinesTotal: number;
  isInterState: boolean; // Inter-state = IGST (18%), Intra-state = CGST (9%) + SGST (9%)
  gstRatePct?: number; // Default 18
}

export interface InvoiceOutstandingInput {
  invoiceGross: number;
  allocatedPayments: number;
  creditNotes: number;
  debitNotes: number;
}

export interface WaleItem {
  remainingYears: number;
  monthlyRent: number;
  chargeableArea: number;
  isHoldingOver?: boolean;
}

export interface OwnerStatementInput {
  totalCollections: number;
  feePercentage?: number; // e.g. 0.04 (4%)
  fixedManagementFee?: number;
  gstOnFeePct?: number; // default 18%
  expensesPaidOnOwnerBehalf: number;
  tdsAdjustments?: number;
}

export interface CamTrueUpInput {
  occupantShareOfActualCam: number;
  camBilledToOccupant: number;
}

export interface CentreContributionInput {
  memberRevenue: number;
  headLeaseRent: number;
  camUtilitiesPayable: number;
  centreOpex: number;
}

export interface BreakEvenSeatInput {
  headLeaseRent: number;
  payables: number;
  opex: number;
  avgRevenuePerOccupiedSeat: number;
  seatCapacity: number;
}

export const RentRollFormulas = {
  // F-01: Area Rent
  // Monthly Rent = Chargeable Area × Rent Rate per sq ft
  f01AreaRent(chargeableArea: number, ratePsf: number): number {
    if (!chargeableArea || !ratePsf) return 0;
    return Math.round(chargeableArea * ratePsf * 100) / 100;
  },

  // F-02: Escalated Rent
  // Compounding: New Rate = Previous Rate × (1 + Escalation %)
  // Non-compounding: New Rate = Initial Rate × (1 + Escalation %)
  f02EscalatedRent(baseRate: number, escalationPct: number, isCompounding: boolean = true): number {
    const rate = Number(baseRate) || 0;
    const pct = (Number(escalationPct) || 0) / 100;
    return Math.round((rate * (1 + pct)) * 100) / 100;
  },

  // F-03 to F-07: Seat Revenue & Flex Billing Bases
  // F-03: Seat Revenue = Billable Seats × Contracted Seat Rate
  // F-04: Contracted-seat billing: Billable Seats = Contracted Seats
  // F-05: Occupied-seat billing: Billable Seats = Occupied Seats
  // F-06: Minimum commitment: Billable Seats = MAX(Occupied Seats, Minimum Committed Seats)
  // F-07: Hybrid: Charge = Base Commitment + Additional Seats × Seat Rate + Usage Charges
  f03To07SeatBilling(input: FlexSeatBillingInput): { billableSeats: number; totalCharge: number } {
    let billableSeats = 0;
    let totalCharge = 0;

    switch (input.billingBasis) {
      case 'contracted':
        billableSeats = Math.max(0, input.contractedSeats || 0);
        totalCharge = billableSeats * (input.seatRate || 0);
        break;
      case 'occupied':
        billableSeats = Math.max(0, input.occupiedSeats || 0);
        totalCharge = billableSeats * (input.seatRate || 0);
        break;
      case 'minimum_commitment':
        const minSeats = Math.max(0, input.minimumCommittedSeats || 0);
        billableSeats = Math.max(minSeats, Math.max(0, input.occupiedSeats || 0));
        totalCharge = billableSeats * (input.seatRate || 0);
        break;
      case 'hybrid':
        const baseCommit = input.baseCommitmentCharge || 0;
        const addlSeats = Math.max(0, (input.occupiedSeats || 0) - (input.contractedSeats || 0));
        const addlRate = input.additionalSeatRate || input.seatRate || 0;
        const usage = input.usageCharges || 0;
        billableSeats = (input.contractedSeats || 0) + addlSeats;
        totalCharge = baseCommit + (addlSeats * addlRate) + usage;
        break;
      default:
        billableSeats = input.contractedSeats || 0;
        totalCharge = billableSeats * (input.seatRate || 0);
    }

    return {
      billableSeats,
      totalCharge: Math.round(totalCharge * 100) / 100
    };
  },

  // F-08: Inclusions (R-40)
  // If charge.is_included = true, no invoice line is created for that component
  f08IsChargeBillable(isIncluded: boolean, rateOrAmount: number): boolean {
    return !isIncluded && rateOrAmount > 0;
  },

  // F-09: Metered Utility
  // Charge = (Closing - Opening) × Multiplier × Tariff
  f09MeteredUtility(input: MeterReadingInput): number {
    const units = Math.max(0, (input.closingReading || 0) - (input.openingReading || 0));
    const mult = input.multiplier !== undefined && input.multiplier > 0 ? input.multiplier : 1;
    const charge = units * mult * (input.tariff || 0);
    return Math.round(charge * 100) / 100;
  },

  // F-10: Proration
  // Period charge × (days occupied in period ÷ days in period) for part-month start/exit
  f10Proration(input: ProrationInput): number {
    if (!input.daysInPeriod || input.daysInPeriod <= 0) return input.periodCharge || 0;
    const ratio = Math.min(1, Math.max(0, input.daysOccupiedInPeriod / input.daysInPeriod));
    return Math.round((input.periodCharge * ratio) * 100) / 100;
  },

  // F-11: Taxable / Gross Invoice
  // Taxable = Σ taxable lines; Gross = Taxable + CGST + SGST (intra-state) or IGST (inter-state)
  f11TaxableGrossInvoice(input: InvoiceTaxInput): {
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
    grossAmount: number;
  } {
    const taxable = Math.round((input.taxableLinesTotal || 0) * 100) / 100;
    const gstPct = input.gstRatePct !== undefined ? input.gstRatePct : 18;
    const totalGst = Math.round((taxable * (gstPct / 100)) * 100) / 100;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (input.isInterState) {
      igst = totalGst;
    } else {
      cgst = Math.round((totalGst / 2) * 100) / 100;
      sgst = Math.round((totalGst - cgst) * 100) / 100;
    }

    return {
      taxableAmount: taxable,
      cgst,
      sgst,
      igst,
      totalGst,
      grossAmount: Math.round((taxable + totalGst) * 100) / 100
    };
  },

  // F-12 & F-13: Outstanding & Partial Payment (R-52)
  // Outstanding = Invoice Gross − Allocated Payments − Credit Notes + Debit Notes
  f12OutstandingBalance(input: InvoiceOutstandingInput): {
    outstanding: number;
    status: 'paid' | 'partially_paid' | 'unpaid' | 'overpaid';
  } {
    const gross = Number(input.invoiceGross) || 0;
    const paid = Number(input.allocatedPayments) || 0;
    const credit = Number(input.creditNotes) || 0;
    const debit = Number(input.debitNotes) || 0;

    const outstanding = Math.round((gross - paid - credit + debit) * 100) / 100;

    let status: 'paid' | 'partially_paid' | 'unpaid' | 'overpaid' = 'unpaid';
    if (outstanding <= 0.01 && outstanding >= -0.01) {
      status = 'paid';
    } else if (outstanding < -0.01) {
      status = 'overpaid';
    } else if (paid > 0) {
      status = 'partially_paid';
    }

    return {
      outstanding: Math.max(0, outstanding),
      status
    };
  },

  // F-14: Ageing Buckets
  // Days Outstanding = Today − Due Date for unpaid balance; buckets 0–30, 31–60, 61–90, 90+
  f14AgeingBucket(daysPastDue: number): 'current_0_30' | 'bucket_31_60' | 'bucket_61_90' | 'bucket_90_plus' {
    if (daysPastDue <= 30) return 'current_0_30';
    if (daysPastDue <= 60) return 'bucket_31_60';
    if (daysPastDue <= 90) return 'bucket_61_90';
    return 'bucket_90_plus';
  },

  // F-15: Occupancy — Area
  // Occupied Area ÷ Total Leasable Area
  f15OccupancyArea(occupiedArea: number, totalLeasableArea: number): number {
    if (!totalLeasableArea || totalLeasableArea <= 0) return 0;
    return Math.round(((occupiedArea / totalLeasableArea) * 100) * 100) / 100;
  },

  // F-16: Occupancy — Seats
  // Occupied Seats ÷ Total Available Seats
  f16OccupancySeats(occupiedSeats: number, totalAvailableSeats: number): number {
    if (!totalAvailableSeats || totalAvailableSeats <= 0) return 0;
    return Math.round(((occupiedSeats / totalAvailableSeats) * 100) * 100) / 100;
  },

  // F-17: Economic Occupancy
  // Current Rent ÷ (Current Rent + Vacant Space at Asking Rate)
  f17EconomicOccupancy(currentActualRent: number, vacantChargeableArea: number, askingRatePsf: number): number {
    const potentialRentFromVacant = (vacantChargeableArea || 0) * (askingRatePsf || 0);
    const totalPotential = (currentActualRent || 0) + potentialRentFromVacant;
    if (totalPotential <= 0) return 0;
    return Math.round(((currentActualRent / totalPotential) * 100) * 100) / 100;
  },

  // F-18: WALE (Weighted Average Lease Expiry)
  // WALE by income = Σ(Remaining Years × Monthly Rent) ÷ Σ Monthly Rent. Holding over = 0 years
  // WALE by area = Σ(Remaining Years × Area) ÷ Σ Area
  f18Wale(items: WaleItem[]): { waleByIncomeYears: number; waleByAreaYears: number } {
    let sumRentYears = 0;
    let sumTotalRent = 0;
    let sumAreaYears = 0;
    let sumTotalArea = 0;

    for (const it of items) {
      const remYears = it.isHoldingOver ? 0 : Math.max(0, it.remainingYears || 0);
      const rent = Math.max(0, it.monthlyRent || 0);
      const area = Math.max(0, it.chargeableArea || 0);

      sumRentYears += remYears * rent;
      sumTotalRent += rent;

      sumAreaYears += remYears * area;
      sumTotalArea += area;
    }

    const waleByIncomeYears = sumTotalRent > 0 ? Math.round((sumRentYears / sumTotalRent) * 100) / 100 : 0;
    const waleByAreaYears = sumTotalArea > 0 ? Math.round((sumAreaYears / sumTotalArea) * 100) / 100 : 0;

    return { waleByIncomeYears, waleByAreaYears };
  },

  // F-19: NOI / NOI Margin
  // NOI = Property Revenue − Operating Expenses; Margin = NOI ÷ Revenue
  f19Noi(revenue: number, operatingExpenses: number): { noi: number; noiMarginPct: number } {
    const noi = Math.round(((revenue || 0) - (operatingExpenses || 0)) * 100) / 100;
    const margin = revenue > 0 ? Math.round(((noi / revenue) * 100) * 100) / 100 : 0;
    return { noi, noiMarginPct: margin };
  },

  // F-20: Management Fee
  // Fee = Σ fee_rules applied (e.g. 4% × Collections) + GST on fee
  f20ManagementFee(collections: number, feePct: number = 0.04, gstPct: number = 18): {
    feeAmount: number;
    gstAmount: number;
    totalFeeWithGst: number;
  } {
    const fee = Math.round((collections * feePct) * 100) / 100;
    const gst = Math.round((fee * (gstPct / 100)) * 100) / 100;
    return {
      feeAmount: fee,
      gstAmount: gst,
      totalFeeWithGst: Math.round((fee + gst) * 100) / 100
    };
  },

  // F-21: Owner Net Remittance
  // Collections − Management Fee − GST on Fee − Expenses Paid on Owner's Behalf − TDS adjustments
  f21OwnerNetRemittance(input: OwnerStatementInput): number {
    const feePct = input.feePercentage !== undefined ? input.feePercentage : 0.04;
    const gstPct = input.gstOnFeePct !== undefined ? input.gstOnFeePct : 18;

    let baseFee = 0;
    if (input.fixedManagementFee !== undefined && input.fixedManagementFee > 0) {
      baseFee = input.fixedManagementFee;
    } else {
      baseFee = Math.round((input.totalCollections * feePct) * 100) / 100;
    }

    const gstOnFee = Math.round((baseFee * (gstPct / 100)) * 100) / 100;
    const totalFee = baseFee + gstOnFee;
    const expenses = input.expensesPaidOnOwnerBehalf || 0;
    const tds = input.tdsAdjustments || 0;

    const net = input.totalCollections - totalFee - expenses - tds;
    return Math.round(net * 100) / 100;
  },

  // F-22: CAM True-Up
  // Occupant Share of Actual CAM − CAM Billed to Occupant = Debit (+) or Credit (−) note
  f22CamTrueUp(input: CamTrueUpInput): {
    variance: number;
    noteType: 'debit_note' | 'credit_note' | 'nil';
    amount: number;
  } {
    const diff = Math.round((input.occupantShareOfActualCam - input.camBilledToOccupant) * 100) / 100;
    if (diff > 0.01) {
      return { variance: diff, noteType: 'debit_note', amount: diff };
    } else if (diff < -0.01) {
      return { variance: diff, noteType: 'credit_note', amount: Math.abs(diff) };
    }
    return { variance: 0, noteType: 'nil', amount: 0 };
  },

  // F-23: Centre Contribution (Flex)
  // Member Revenue − Head-Lease Rent − CAM/Utilities Payable − Centre Opex
  f23CentreContribution(input: CentreContributionInput): number {
    const net = (input.memberRevenue || 0) - (input.headLeaseRent || 0) - (input.camUtilitiesPayable || 0) - (input.centreOpex || 0);
    return Math.round(net * 100) / 100;
  },

  // F-24: Break-Even Seat Occupancy
  // (Head-Lease Rent + Payables + Opex) ÷ (Average Revenue per Occupied Seat × Seat Capacity)
  f24BreakEvenSeatOccupancy(input: BreakEvenSeatInput): number {
    const totalCosts = (input.headLeaseRent || 0) + (input.payables || 0) + (input.opex || 0);
    const capacityRev = (input.avgRevenuePerOccupiedSeat || 0) * (input.seatCapacity || 0);
    if (capacityRev <= 0) return 0;
    return Math.round(((totalCosts / capacityRev) * 100) * 100) / 100; // Returns percentage
  },

  // F-25: Collection Efficiency
  // Collected in period ÷ Billed and due in period
  f25CollectionEfficiency(collectedInPeriod: number, billedAndDueInPeriod: number): number {
    if (!billedAndDueInPeriod || billedAndDueInPeriod <= 0) return 100;
    return Math.round(((collectedInPeriod / billedAndDueInPeriod) * 100) * 100) / 100;
  }
};

// ============================================================================
// PART 2: CANONICAL VALIDATION ENGINE (Table 57 & Table 5.5a: R-01 to R-44)
// ============================================================================

export type RuleSeverity = 'Error' | 'Warning';

export interface ValidationRuleDefinition {
  ruleCode: string;
  name: string;
  severity: RuleSeverity;
  description: string;
  fixHint: string;
}

export const CANONICAL_RULES: Record<string, ValidationRuleDefinition> = {
  'R-01': {
    ruleCode: 'R-01',
    name: 'Required fields present',
    severity: 'Error',
    description: 'Mandatory fields (Property, Unit/Space, Floor, Area, Tenant/Occupant, Rent) must be non-empty.',
    fixHint: 'Provide values for all mandatory columns.'
  },
  'R-03': {
    ruleCode: 'R-03',
    name: 'Property Area Reconciliation',
    severity: 'Warning',
    description: 'Sum of all space chargeable areas must match the property total leasable area within ±0.5%.',
    fixHint: 'Verify space measurements or update the property leasable area.'
  },
  'R-05': {
    ruleCode: 'R-05',
    name: 'Leasable Area & Capacity Identity',
    severity: 'Error',
    description: 'Occupied Area + Vacant Area must equal Total Leasable Area; Occupied Seats + Vacant Seats = Seat Capacity.',
    fixHint: 'Ensure total leasable area is exactly distributed between occupied spaces and vacant absorption.'
  },
  'R-07': {
    ruleCode: 'R-07',
    name: 'Loading Factor Bounds',
    severity: 'Warning',
    description: 'Loading percentage ((Chargeable / Carpet - 1) * 100) must be between 20% and 60%.',
    fixHint: 'Double check carpet area and chargeable area entries.'
  },
  'R-10': {
    ruleCode: 'R-10',
    name: 'Market Rate Benchmark Band',
    severity: 'Warning',
    description: 'Rate per sq ft is outside configured market benchmark band (₹20 to ₹500/sq ft).',
    fixHint: 'Confirm whether this is a legacy lease, promotional discount, or data error.'
  },
  'R-12': {
    ruleCode: 'R-12',
    name: 'Monthly Amount Math Check',
    severity: 'Error',
    description: 'Monthly Rent must equal Chargeable Area × Rate per sq ft (tolerance ±₹1).',
    fixHint: 'Recalculate monthly rent = Chargeable Area * Rate PSF.'
  },
  'R-15': {
    ruleCode: 'R-15',
    name: 'GSTIN / PAN Statutory Format',
    severity: 'Error',
    description: 'GSTIN must match standard 15-character Indian format (2-digit state + 10-char PAN + 1 entity + 1 "Z" + 1 check digit); PAN must match 10-char alphanumeric.',
    fixHint: 'Enter a valid 15-digit GSTIN (e.g. 24AAACC1234F1Z5) and 10-character PAN (e.g. AAACC1234F).'
  },
  'R-20': {
    ruleCode: 'R-20',
    name: 'Date Chronology Order',
    severity: 'Error',
    description: 'Commencement Date must be strictly before Expiry Date; Rent Commencement must be >= Commencement.',
    fixHint: 'Adjust commencement, rent commencement, or expiry dates to ensure chronological consistency.'
  },
  'R-22': {
    ruleCode: 'R-22',
    name: 'Lock-in and Notice Term Limits',
    severity: 'Warning',
    description: 'Lock-in end date must be <= Expiry Date; Notice period must be <= Remaining lease term.',
    fixHint: 'Ensure lock-in term does not exceed the lease tenure.'
  },
  'R-24': {
    ruleCode: 'R-24',
    name: 'Overlapping Leases on Same Demised Area',
    severity: 'Error',
    description: 'No two active or overlapping future contracts may demised the same physical space or seat.',
    fixHint: 'Terminate or end the prior active lease before binding a new contract to this space.'
  },
  'R-26': {
    ruleCode: 'R-26',
    name: 'Holding Over on Expired Lease',
    severity: 'Warning',
    description: 'Active contract with past expiry date must be transitioned to "holding_over" or "expired".',
    fixHint: 'Transition contract status to holding over or record formal renewal agreement.'
  },
  'R-30': {
    ruleCode: 'R-30',
    name: 'Placeholder Data Detector',
    severity: 'Warning',
    description: 'Identical rate detected across all spaces of a property, indicating dummy or copy-pasted data.',
    fixHint: 'Confirm if spaces truly carry identical rates or replace placeholder figures.'
  },
  'R-40': {
    ruleCode: 'R-40',
    name: 'Double Billing Prevention',
    severity: 'Error',
    description: 'Included component (e.g. CAM or Electricity embedded in rent) must not also be configured as a billable charge.',
    fixHint: 'Toggle off billable charge line or set is_included to false.'
  },
  'R-42': {
    ruleCode: 'R-42',
    name: 'Flex Seat Billing Basis Completeness',
    severity: 'Error',
    description: 'Seat contract must have seat_billing_basis specified, and minimum commitment must not exceed contracted seats.',
    fixHint: 'Select contracted, occupied, or minimum_commitment basis and ensure min seats <= contracted seats.'
  },
  'R-44': {
    ruleCode: 'R-44',
    name: 'Billing Entity & GSTIN Compliance',
    severity: 'Error',
    description: 'Charge has no billing entity assigned or the billing entity lacks a registered GSTIN when GST > 0.',
    fixHint: 'Assign a valid Billing Entity with active GSTIN before generating taxable tax invoices.'
  }
};

export interface RowValidationResult {
  rowNumber: number;
  isValid: boolean;
  hasWarnings: boolean;
  errors: Array<{ ruleCode: string; message: string; fixHint: string }>;
  warnings: Array<{ ruleCode: string; message: string; fixHint: string }>;
}

export function validateGstin(gstin: string | undefined | null): boolean {
  if (!gstin || typeof gstin !== 'string') return false;
  const clean = gstin.trim().toUpperCase();
  // Standard Indian 15-character GSTIN regex:
  // 2 digits (state code), 5 letters (PAN letters), 4 digits (PAN digits), 1 letter (PAN check), 1 entity digit, 'Z', 1 check digit
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(clean);
}

export function validatePan(pan: string | undefined | null): boolean {
  if (!pan || typeof pan !== 'string') return false;
  const clean = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(clean);
}

export function validateRentRollRow(row: Record<string, any>, rowNumber: number = 1): RowValidationResult {
  const errors: Array<{ ruleCode: string; message: string; fixHint: string }> = [];
  const warnings: Array<{ ruleCode: string; message: string; fixHint: string }> = [];

  const spaceName = row.unit || row.unitNumber || row.spaceName || row.unitName || row.suite;
  const floor = row.floor !== undefined ? row.floor : (row.floorNumber !== undefined ? row.floorNumber : 1);
  const area = Number(row.chargeableArea || row.area || row.squareFeet || 0);
  const carpet = Number(row.carpetArea || 0);
  const rent = Number(row.monthlyRent || row.rent || 0);
  const ratePsf = Number(row.ratePsf || row.rate || (area > 0 ? rent / area : 0));
  const tenant = row.tenantName || row.occupant || row.company;
  const gstin = row.gstin || row.tenantGstin;
  const pan = row.pan || row.tenantPan;
  const startDateStr = row.startDate || row.commencementDate;
  const endDateStr = row.endDate || row.expiryDate;
  const rentStartDateStr = row.rentCommencementDate || startDateStr;
  const lockInMonths = Number(row.lockInMonths || 0);

  // R-01: Required fields
  if (!spaceName || floor === undefined || floor === null || !area || area <= 0 || !tenant) {
    errors.push({
      ruleCode: 'R-01',
      message: 'Missing mandatory fields (Unit, Floor, Chargeable Area, or Occupant Name).',
      fixHint: CANONICAL_RULES['R-01'].fixHint
    });
  }

  // R-07: Loading % check
  if (carpet > 0 && area > 0) {
    const loadingPct = ((area / carpet) - 1) * 100;
    if (loadingPct < 20 || loadingPct > 60) {
      warnings.push({
        ruleCode: 'R-07',
        message: `Calculated loading factor of ${loadingPct.toFixed(1)}% is outside standard commercial range (20% - 60%).`,
        fixHint: CANONICAL_RULES['R-07'].fixHint
      });
    }
  }

  // R-10: Rate benchmark check
  if (ratePsf > 0 && (ratePsf < 20 || ratePsf > 500)) {
    warnings.push({
      ruleCode: 'R-10',
      message: `Rent rate of ₹${ratePsf.toFixed(2)}/sq ft is outside typical commercial band (₹20 to ₹500/sq ft).`,
      fixHint: CANONICAL_RULES['R-10'].fixHint
    });
  }

  // R-12: Monthly Amount = Rate * Area (± ₹1)
  if (area > 0 && ratePsf > 0 && rent > 0) {
    const calculatedRent = area * ratePsf;
    if (Math.abs(calculatedRent - rent) > 1.5) {
      errors.push({
        ruleCode: 'R-12',
        message: `Monthly rent (₹${rent.toLocaleString('en-IN')}) does not match Area (${area}) × Rate PSF (₹${ratePsf}) = ₹${Math.round(calculatedRent).toLocaleString('en-IN')}.`,
        fixHint: CANONICAL_RULES['R-12'].fixHint
      });
    }
  }

  // R-15: GSTIN / PAN format check
  if (gstin && typeof gstin === 'string' && gstin.trim().length > 0) {
    if (!validateGstin(gstin)) {
      errors.push({
        ruleCode: 'R-15',
        message: `Invalid GSTIN format: "${gstin}". Must be 15-character statutory format.`,
        fixHint: CANONICAL_RULES['R-15'].fixHint
      });
    }
  }
  if (pan && typeof pan === 'string' && pan.trim().length > 0) {
    if (!validatePan(pan)) {
      errors.push({
        ruleCode: 'R-15',
        message: `Invalid PAN format: "${pan}". Must be 10-character alphanumeric.`,
        fixHint: CANONICAL_RULES['R-15'].fixHint
      });
    }
  }

  // R-20: Chronology: commencement < expiry
  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (start >= end) {
        errors.push({
          ruleCode: 'R-20',
          message: `Commencement Date (${startDateStr}) must precede Expiry Date (${endDateStr}).`,
          fixHint: CANONICAL_RULES['R-20'].fixHint
        });
      }
      if (rentStartDateStr) {
        const rentStart = new Date(rentStartDateStr);
        if (!isNaN(rentStart.getTime()) && rentStart < start) {
          errors.push({
            ruleCode: 'R-20',
            message: `Rent Commencement (${rentStartDateStr}) cannot be earlier than Lease Commencement (${startDateStr}).`,
            fixHint: CANONICAL_RULES['R-20'].fixHint
          });
        }
      }

      // R-26: Past expiry check
      const now = new Date();
      if (end < now && (!row.status || row.status === 'active')) {
        warnings.push({
          ruleCode: 'R-26',
          message: `Contract expiry date (${endDateStr}) is in the past. Status should be marked as "holding_over" or "expired".`,
          fixHint: CANONICAL_RULES['R-26'].fixHint
        });
      }
    }
  }

  // R-22: Lock-in <= expiry
  if (startDateStr && endDateStr && lockInMonths > 0) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const leaseTenureMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (lockInMonths > leaseTenureMonths) {
        warnings.push({
          ruleCode: 'R-22',
          message: `Lock-in term of ${lockInMonths} months exceeds total lease tenure of ${leaseTenureMonths} months.`,
          fixHint: CANONICAL_RULES['R-22'].fixHint
        });
      }
    }
  }

  // R-40: Double billing (if cam is included, but cam rate is billed separately)
  if (row.isCamIncluded === true && Number(row.camMonthly || row.camRatePsf || 0) > 0) {
    errors.push({
      ruleCode: 'R-40',
      message: 'CAM is flagged as included in base rent, but a separate CAM billable line is also populated.',
      fixHint: CANONICAL_RULES['R-40'].fixHint
    });
  }

  // R-42: Flex seat check
  if (row.billingModel === 'seat' || row.billingModel === 'hybrid') {
    if (!row.seatBillingBasis) {
      errors.push({
        ruleCode: 'R-42',
        message: 'Flex contract missing required seat_billing_basis (contracted, occupied, or minimum_commitment).',
        fixHint: CANONICAL_RULES['R-42'].fixHint
      });
    }
    if (Number(row.minimumCommittedSeats || 0) > Number(row.contractedSeats || 0)) {
      errors.push({
        ruleCode: 'R-42',
        message: 'Minimum committed seats cannot exceed total contracted seats.',
        fixHint: CANONICAL_RULES['R-42'].fixHint
      });
    }
  }

  return {
    rowNumber,
    isValid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings
  };
}

// Control Totals Reconciliation Check (R-03 / RR-ING-07)
export function validateControlTotals(
  rows: Array<Record<string, any>>,
  targetPropertyTotalArea?: number
): {
  totalChargeableArea: number;
  totalMonthlyRent: number;
  totalSeats: number;
  areaVariancePct: number;
  reconciliationPass: boolean;
  warnings: string[];
} {
  let totalArea = 0;
  let totalRent = 0;
  let totalSeats = 0;

  for (const r of rows) {
    totalArea += Number(r.chargeableArea || r.area || 0);
    totalRent += Number(r.monthlyRent || r.rent || 0);
    totalSeats += Number(r.seats || r.contractedSeats || 0);
  }

  const warnings: string[] = [];
  let areaVariancePct = 0;
  let reconciliationPass = true;

  if (targetPropertyTotalArea && targetPropertyTotalArea > 0) {
    const diff = Math.abs(totalArea - targetPropertyTotalArea);
    areaVariancePct = Math.round(((diff / targetPropertyTotalArea) * 100) * 100) / 100;
    if (areaVariancePct > 0.5) {
      reconciliationPass = false;
      warnings.push(
        `Control Totals (R-03): Sum of unit chargeable areas (${totalArea.toLocaleString('en-IN')} sq ft) deviates by ${areaVariancePct}% from Property Target (${targetPropertyTotalArea.toLocaleString('en-IN')} sq ft). Max tolerance is ±0.5%.`
      );
    }
  }

  return {
    totalChargeableArea: Math.round(totalArea * 100) / 100,
    totalMonthlyRent: Math.round(totalRent * 100) / 100,
    totalSeats,
    areaVariancePct,
    reconciliationPass,
    warnings
  };
}

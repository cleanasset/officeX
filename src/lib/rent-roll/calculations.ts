/**
 * OFFICEX Rent Roll — Calculation Service
 * Implements Derived Fields D-01 to D-30 and Business Formulas F-01 to F-25
 * Reference: OFFICEX-SCL-RR-IMP-002 V2.1 & OFFICEX-SCL-RR-UX-003 V1.0 §6
 */

export interface ContractSpaceCalc {
  spaceId: string;
  spaceCode?: string;
  areaLet: number;
  seatsAllocated?: number;
}

export interface ContractChargeCalc {
  id?: string;
  component: string; // base_rent, cam, electricity, parking, dg_backup, water, internet, etc.
  calcBasis: 'per_area' | 'per_seat' | 'fixed' | 'per_slot' | 'metered' | 'pro_rata_share' | 'pct_of_turnover' | 'per_use';
  rate: number;
  ratePeriod?: 'month' | 'quarter' | 'year';
  quantityBasis?: number;
  isIncluded: boolean;
  invoiceGroup: 'rent' | 'cam' | 'electricity' | 'water' | 'parking' | 'services' | 'seat_fee' | 'extras';
  billingEntityGstin?: string;
  taxProfileId?: string;
  gstRate?: number; // e.g. 18 for 18%
  hsnSac?: string;
  startDate?: string;
  endDate?: string;
}

export interface RentStepCalc {
  stepNumber: number;
  effectiveDate: string; // YYYY-MM-DD
  rate: number;
  monthlyAmount?: number;
  escalationPct?: number;
  stepType?: 'fixed_pct' | 'fixed_amount' | 'cpi_linked' | 'market_review' | 'stepped_schedule';
  status: 'applied' | 'scheduled' | 'skipped' | 'disputed' | 'pending';
  compounding?: boolean;
}

export interface ConcessionCalc {
  concessionType: 'rent_free' | 'fitout_contribution' | 'discount_pct' | 'discount_amount' | 'capex_by_landlord';
  startDate: string;
  endDate: string;
  value: number; // % or amount
  contractChargeId?: string;
  amortise?: boolean;
}

export interface DepositCalc {
  depositType: 'security_deposit' | 'advance_rent' | 'bank_guarantee' | 'cam_deposit' | 'utility_deposit';
  basisMonths?: number;
  basisComponent?: string;
  requiredAmount: number;
  heldAmount: number;
  topUpOnEscalation?: boolean;
  bgBank?: string;
  bgNumber?: string;
  bgExpiryDate?: string;
}

export interface ContractCalcInput {
  id?: string;
  contractCode?: string;
  contractType?: string;
  billingModel: 'area' | 'seat' | 'hybrid' | 'fixed' | 'revenue_share' | 'charges_only';
  status: 'draft' | 'future' | 'active' | 'notice_served' | 'holding_over' | 'expired' | 'terminated';
  commencementDate: string;
  rentCommencementDate: string;
  expiryDate: string;
  lockInMonths?: number;
  lockInEndDate?: string;
  noticePeriodMonths?: number;
  autoRenew?: boolean;
  spaces: ContractSpaceCalc[];
  charges: ContractChargeCalc[];
  steps?: RentStepCalc[];
  concessions?: ConcessionCalc[];
  deposits?: DepositCalc[];
  seatsContracted?: number;
  seatsMinimum?: number;
  seatBillingBasis?: 'contracted' | 'occupied' | 'minimum_commitment';
  baseCommitmentAmount?: number;
  baseCommitmentSeats?: number;
  occupiedSeats?: number;
  tdsApplicable?: boolean;
  tdsRate?: number;
  billingCurrency?: string;
  billingFrequency?: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
}

/** Utility: Round half-up to specified decimal places */
export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Utility: Format currency to Indian grouping (₹1,45,45,200.00) */
export function formatINR(amount: number, showDecimals: boolean = true): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const fixed = absVal.toFixed(2);
  const [intPart, decPart] = fixed.split('.');

  let lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const result = showDecimals ? `${formattedInt}.${decPart}` : formattedInt;
  return isNegative ? `(₹${result})` : `₹${result}`;
}

/** Utility: Abbreviate INR for dashboard tiles (₹1.45 Cr, ₹24.2 L) */
export function formatINRAbbreviated(amount: number): string {
  const absVal = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absVal >= 10000000) {
    return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
  }
  if (absVal >= 100000) {
    return `${sign}₹${(absVal / 100000).toFixed(2)} L`;
  }
  return `${sign}₹${round(absVal, 0).toLocaleString('en-IN')}`;
}

/** D-07: Current Rate as of date */
export function calculateCurrentRate(charges: ContractChargeCalc[], steps?: RentStepCalc[], asOfDateStr?: string): number {
  const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date();

  // If there are rent steps, find the latest applied step <= asOf
  if (steps && steps.length > 0) {
    const applicableSteps = steps
      .filter(s => new Date(s.effectiveDate) <= asOf && s.status === 'applied')
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

    if (applicableSteps.length > 0) {
      return round(applicableSteps[0].rate, 4);
    }

    // If step 1 exists
    const step1 = steps.find(s => s.stepNumber === 1);
    if (step1) {
      return round(step1.rate, 4);
    }
  }

  // Fallback to base_rent or seat_fee charge rate
  const baseCharge = charges.find(c => c.component === 'base_rent' || c.component === 'seat_fee');
  return baseCharge ? round(baseCharge.rate, 4) : 0;
}

/** D-01: Monthly Base Rent (Area model, F-01) */
export function calculateMonthlyBaseRent(input: ContractCalcInput, asOfDateStr?: string): number {
  if (input.billingModel !== 'area' && input.billingModel !== 'fixed') {
    return 0;
  }
  const currentRate = calculateCurrentRate(input.charges, input.steps, asOfDateStr);
  const totalArea = input.spaces.reduce((acc, s) => acc + (s.areaLet || 0), 0);
  return round(totalArea * currentRate, 2);
}

/** F-04, F-05, F-06, F-07: Billable Seats & D-02 Monthly Seat Fee */
export function calculateMonthlySeatFee(input: ContractCalcInput, asOfDateStr?: string): { billableSeats: number; monthlySeatFee: number } {
  if (input.billingModel !== 'seat' && input.billingModel !== 'hybrid') {
    return { billableSeats: 0, monthlySeatFee: 0 };
  }

  const contracted = input.seatsContracted || 0;
  const minimum = input.seatsMinimum || 0;
  const occupied = input.occupiedSeats || 0;
  const seatRate = calculateCurrentRate(input.charges, input.steps, asOfDateStr);

  let billableSeats = 0;
  let fee = 0;

  if (input.billingModel === 'seat') {
    const basis = input.seatBillingBasis || 'contracted';
    if (basis === 'contracted') {
      billableSeats = contracted; // F-04
    } else if (basis === 'occupied') {
      billableSeats = occupied; // F-05
    } else {
      // minimum_commitment (F-06)
      billableSeats = Math.max(occupied, minimum);
    }
    fee = round(billableSeats * seatRate, 2);
  } else if (input.billingModel === 'hybrid') {
    // F-07: Base commitment + Max(0, occupied - seats_covered) * seat_rate
    const baseCommitment = input.baseCommitmentAmount || 0;
    const seatsCovered = input.baseCommitmentSeats || 0;
    const extraSeats = Math.max(0, occupied - seatsCovered);
    billableSeats = seatsCovered + extraSeats;
    fee = round(baseCommitment + (extraSeats * seatRate), 2);
  }

  return { billableSeats, monthlySeatFee: fee };
}

/** D-03: Annualised Base Rent */
export function calculateAnnualisedBaseRent(monthlyBase: number): number {
  return round(monthlyBase * 12, 2);
}

/** D-04: CAM (Monthly) */
export function calculateMonthlyCAM(input: ContractCalcInput): { amount: number; isIncluded: boolean; text: string } {
  const camCharge = input.charges.find(c => c.component === 'cam');
  if (!camCharge) {
    return { amount: 0, isIncluded: false, text: '—' };
  }
  if (camCharge.isIncluded) {
    return { amount: 0, isIncluded: true, text: 'Included' };
  }

  let amount = 0;
  if (camCharge.calcBasis === 'per_area') {
    const totalArea = input.spaces.reduce((acc, s) => acc + (s.areaLet || 0), 0);
    amount = round((camCharge.quantityBasis || totalArea) * camCharge.rate, 2);
  } else if (camCharge.calcBasis === 'fixed') {
    amount = round(camCharge.rate, 2);
  }
  return { amount, isIncluded: false, text: formatINR(amount) };
}

/** D-05: Gross Monthly Recurring Charges (F-01 + F-03 + F-08 + fixed parking, etc.) */
export function calculateGrossMonthlyRecurring(input: ContractCalcInput, asOfDateStr?: string): number {
  let gross = 0;

  // Base rent / seat fee
  if (input.billingModel === 'area' || input.billingModel === 'fixed') {
    gross += calculateMonthlyBaseRent(input, asOfDateStr);
  } else if (input.billingModel === 'seat' || input.billingModel === 'hybrid') {
    gross += calculateMonthlySeatFee(input, asOfDateStr).monthlySeatFee;
  }

  // Other non-included recurring charges (CAM, Parking, Signage, etc. Exclude base rent and metered)
  const totalArea = input.spaces.reduce((acc, s) => acc + (s.areaLet || 0), 0);
  for (const charge of input.charges) {
    if (charge.isIncluded) continue;
    if (charge.component === 'base_rent' || charge.component === 'seat_fee') continue;
    if (charge.calcBasis === 'metered' || charge.calcBasis === 'per_use' || charge.calcBasis === 'pct_of_turnover') continue;

    let chargeAmt = 0;
    if (charge.calcBasis === 'per_area') {
      chargeAmt = (charge.quantityBasis || totalArea) * charge.rate;
    } else if (charge.calcBasis === 'per_seat') {
      const seats = input.seatsContracted || 0;
      chargeAmt = (charge.quantityBasis || seats) * charge.rate;
    } else if (charge.calcBasis === 'per_slot') {
      chargeAmt = (charge.quantityBasis || 1) * charge.rate;
    } else if (charge.calcBasis === 'fixed') {
      chargeAmt = charge.rate;
    }
    gross += chargeAmt;
  }

  return round(gross, 2);
}

/** D-06: Effective Rate */
export function calculateEffectiveRate(grossMonthly: number, input: ContractCalcInput): number {
  if (input.billingModel === 'area' || input.billingModel === 'fixed') {
    const totalArea = input.spaces.reduce((acc, s) => acc + (s.areaLet || 0), 0);
    return totalArea > 0 ? round(grossMonthly / totalArea, 2) : 0;
  }
  const billable = calculateMonthlySeatFee(input).billableSeats;
  return billable > 0 ? round(grossMonthly / billable, 2) : 0;
}

/** D-08 & D-09: Next Escalation Date & Uplift */
export function calculateNextEscalation(
  charges: ContractChargeCalc[],
  steps?: RentStepCalc[],
  totalAreaOrSeats: number = 0,
  asOfDateStr?: string
): { nextDate: string | null; upliftMonthly: number; nextRate: number | null; daysUntil: number | null } {
  if (!steps || steps.length === 0) {
    return { nextDate: null, upliftMonthly: 0, nextRate: null, daysUntil: null };
  }
  const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date();
  const currentRate = calculateCurrentRate(charges, steps, asOfDateStr);

  const futureSteps = steps
    .filter(s => new Date(s.effectiveDate) > asOf)
    .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());

  if (futureSteps.length === 0) {
    return { nextDate: null, upliftMonthly: 0, nextRate: null, daysUntil: null };
  }

  const nextStep = futureSteps[0];
  const upliftRate = Math.max(0, nextStep.rate - currentRate);
  const upliftMonthly = round(upliftRate * totalAreaOrSeats, 2);
  const diffTime = new Date(nextStep.effectiveDate).getTime() - asOf.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    nextDate: nextStep.effectiveDate,
    upliftMonthly,
    nextRate: nextStep.rate,
    daysUntil,
  };
}

/** D-10 & D-11: Days to Expiry, Term Months, Remaining Years */
export function calculateContractTimeline(commencementDateStr: string, expiryDateStr: string, asOfDateStr?: string) {
  const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date();
  const start = new Date(commencementDateStr);
  const expiry = new Date(expiryDateStr);

  const diffTime = expiry.getTime() - asOf.getTime();
  const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Months between start and expiry (+1 day)
  const termMonths = (expiry.getFullYear() - start.getFullYear()) * 12 + (expiry.getMonth() - start.getMonth()) + 1;
  const remainingYears = round(Math.max(0, daysToExpiry) / 365.25, 2);

  return { daysToExpiry, termMonths, remainingYears };
}

/** D-12: Latest Notice Date & Earliest Exit Date */
export function calculateNoticeAndExit(
  commencementDateStr: string,
  expiryDateStr: string,
  noticePeriodMonths: number = 3,
  lockInEndDateStr?: string,
  asOfDateStr?: string
) {
  const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date();
  const expiry = new Date(expiryDateStr);

  // Latest notice = expiry - noticePeriodMonths
  const latestNotice = new Date(expiry);
  latestNotice.setMonth(latestNotice.getMonth() - noticePeriodMonths);

  // Earliest exit = MAX(lock_in_end_date, as_of + notice period)
  const asOfPlusNotice = new Date(asOf);
  asOfPlusNotice.setMonth(asOfPlusNotice.getMonth() + noticePeriodMonths);

  let earliestExit = asOfPlusNotice;
  if (lockInEndDateStr) {
    const lockInEnd = new Date(lockInEndDateStr);
    if (lockInEnd > asOfPlusNotice) {
      earliestExit = lockInEnd;
    }
  }

  const toDateString = (d: Date) => d.toISOString().split('T')[0];

  return {
    latestNoticeDate: toDateString(latestNotice),
    earliestExitDate: toDateString(earliestExit),
  };
}

/** D-13: Deposit Required, Shortfall, Cover */
export function calculateDepositMetrics(deposits: DepositCalc[] = [], monthlyBaseRent: number = 0) {
  const totalRequired = deposits.reduce((acc, d) => acc + (d.requiredAmount || 0), 0);
  const totalHeld = deposits.reduce((acc, d) => acc + (d.heldAmount || 0), 0);
  const shortfall = Math.max(0, round(totalRequired - totalHeld, 2));
  const coverMonths = monthlyBaseRent > 0 ? round(totalHeld / monthlyBaseRent, 1) : 0;

  return {
    totalRequired: round(totalRequired, 2),
    totalHeld: round(totalHeld, 2),
    shortfall,
    coverMonths,
  };
}

/** D-14: Loading % */
export function calculateLoadingPct(chargeableArea: number, carpetArea: number): number {
  if (carpetArea <= 0) return 0;
  return round(((chargeableArea / carpetArea) - 1) * 100, 1);
}

/** D-15: Rent-free Days Remaining */
export function calculateRentFreeDaysRemaining(concessions: ConcessionCalc[] = [], asOfDateStr?: string): number {
  const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date();
  const rentFreeConcession = concessions.find(c => c.concessionType === 'rent_free');
  if (!rentFreeConcession) return 0;

  const end = new Date(rentFreeConcession.endDate);
  const diffTime = end.getTime() - asOf.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, days);
}

/** D-18: Proration (F-10) */
export function calculateProration(monthlyAmount: number, daysOccupiedInMonth: number, totalDaysInMonth: number): number {
  if (totalDaysInMonth <= 0) return 0;
  return round((monthlyAmount * daysOccupiedInMonth) / totalDaysInMonth, 2);
}

/** D-19: GST Split */
export function calculateGSTSplit(taxableAmount: number, gstRatePct: number, billingGstin: string = '', propertyStateCode: string = '') {
  const billingState = billingGstin.substring(0, 2);
  const isIntraState = billingState && propertyStateCode && billingState === propertyStateCode;

  const totalTax = round((taxableAmount * gstRatePct) / 100, 2);
  if (isIntraState) {
    const halfTax = round(totalTax / 2, 2);
    return {
      taxType: 'intra_state' as const,
      cgstRate: gstRatePct / 2,
      cgstAmount: halfTax,
      sgstRate: gstRatePct / 2,
      sgstAmount: halfTax,
      igstRate: 0,
      igstAmount: 0,
      totalTax,
      grossAmount: round(taxableAmount + totalTax, 2),
    };
  }

  return {
    taxType: 'inter_state' as const,
    cgstRate: 0,
    cgstAmount: 0,
    sgstRate: 0,
    sgstAmount: 0,
    igstRate: gstRatePct,
    igstAmount: totalTax,
    totalTax,
    grossAmount: round(taxableAmount + totalTax, 2),
  };
}

/** D-21: Escalation Schedule Generator */
export function generateEscalationSchedule(
  initialRate: number,
  commencementDateStr: string,
  expiryDateStr: string,
  escalationPct: number,
  cycleMonths: number = 36,
  compounding: boolean = true,
  escalationType: 'fixed_pct' | 'fixed_amount' = 'fixed_pct',
  totalQuantity: number = 1
): RentStepCalc[] {
  const steps: RentStepCalc[] = [];
  const start = new Date(commencementDateStr);
  const expiry = new Date(expiryDateStr);

  // Step 1: Initial rate from commencement
  steps.push({
    stepNumber: 1,
    effectiveDate: commencementDateStr,
    rate: round(initialRate, 2),
    monthlyAmount: round(initialRate * totalQuantity, 2),
    escalationPct: 0,
    stepType: escalationType,
    status: 'applied',
    compounding,
  });

  let stepNumber = 2;
  let currentRate = initialRate;
  let nextDate = new Date(start);
  nextDate.setMonth(nextDate.getMonth() + cycleMonths);

  while (nextDate < expiry) {
    if (escalationType === 'fixed_pct') {
      if (compounding) {
        currentRate = round(currentRate * (1 + escalationPct / 100), 2);
      } else {
        currentRate = round(initialRate * (1 + ((escalationPct / 100) * (stepNumber - 1))), 2);
      }
    } else {
      // Fixed amount
      currentRate = round(currentRate + escalationPct, 2);
    }

    const effectiveDateStr = nextDate.toISOString().split('T')[0];
    steps.push({
      stepNumber,
      effectiveDate: effectiveDateStr,
      rate: currentRate,
      monthlyAmount: round(currentRate * totalQuantity, 2),
      escalationPct,
      stepType: escalationType,
      status: 'scheduled',
      compounding,
    });

    stepNumber++;
    nextDate.setMonth(nextDate.getMonth() + cycleMonths);
  }

  return steps;
}

/** F-18: WALE Calculation (Income & Area) */
export function calculateWALE(contracts: { annualRevenue: number; area: number; remainingYears: number }[]) {
  const totalRevenue = contracts.reduce((acc, c) => acc + c.annualRevenue, 0);
  const totalArea = contracts.reduce((acc, c) => acc + c.area, 0);

  const weightedRevenueYears = contracts.reduce((acc, c) => acc + (c.annualRevenue * c.remainingYears), 0);
  const weightedAreaYears = contracts.reduce((acc, c) => acc + (c.area * c.remainingYears), 0);

  const waleIncome = totalRevenue > 0 ? round(weightedRevenueYears / totalRevenue, 2) : 0;
  const waleArea = totalArea > 0 ? round(weightedAreaYears / totalArea, 2) : 0;

  return { waleIncome, waleArea };
}

/** F-15 & F-16: Occupancy Rates */
export function calculateOccupancy(
  totalCapacityArea: number,
  occupiedArea: number,
  totalCapacitySeats: number = 0,
  occupiedSeats: number = 0
) {
  const areaOccupancyPct = totalCapacityArea > 0 ? round((occupiedArea / totalCapacityArea) * 100, 1) : 0;
  const seatOccupancyPct = totalCapacitySeats > 0 ? round((occupiedSeats / totalCapacitySeats) * 100, 1) : 0;

  return { areaOccupancyPct, seatOccupancyPct };
}

/** Comprehensive Contract Calculations Result */
export function calculateContractSummary(input: ContractCalcInput, asOfDateStr?: string) {
  const asOf = asOfDateStr || new Date().toISOString().split('T')[0];
  const totalArea = input.spaces.reduce((acc, s) => acc + (s.areaLet || 0), 0);
  const currentRate = calculateCurrentRate(input.charges, input.steps, asOf);

  let monthlyBase = 0;
  let billableSeats = 0;

  if (input.billingModel === 'area' || input.billingModel === 'fixed') {
    monthlyBase = calculateMonthlyBaseRent(input, asOf);
  } else if (input.billingModel === 'seat' || input.billingModel === 'hybrid') {
    const seatRes = calculateMonthlySeatFee(input, asOf);
    monthlyBase = seatRes.monthlySeatFee;
    billableSeats = seatRes.billableSeats;
  }

  const annualisedBase = calculateAnnualisedBaseRent(monthlyBase);
  const camInfo = calculateMonthlyCAM(input);
  const grossMonthly = calculateGrossMonthlyRecurring(input, asOf);
  const effectiveRate = calculateEffectiveRate(grossMonthly, input);

  const totalQty = (input.billingModel === 'seat' || input.billingModel === 'hybrid') ? billableSeats : totalArea;
  const nextEsc = calculateNextEscalation(input.charges, input.steps, totalQty, asOf);
  const timeline = calculateContractTimeline(input.commencementDate, input.expiryDate, asOf);
  const noticeExit = calculateNoticeAndExit(
    input.commencementDate,
    input.expiryDate,
    input.noticePeriodMonths || 3,
    input.lockInEndDate,
    asOf
  );
  const depositMetrics = calculateDepositMetrics(input.deposits, monthlyBase);
  const rentFreeDays = calculateRentFreeDaysRemaining(input.concessions, asOf);

  const tdsPct = input.tdsApplicable !== false ? (input.tdsRate || 10) : 0;
  const expectedMonthlyTDS = round((monthlyBase * tdsPct) / 100, 2);

  return {
    asOfDate: asOf,
    totalArea,
    billableSeats,
    currentRate,
    monthlyBaseRent: monthlyBase,
    annualisedBaseRent: annualisedBase,
    monthlyCAM: camInfo.amount,
    camText: camInfo.text,
    camIsIncluded: camInfo.isIncluded,
    grossMonthlyRecurring: grossMonthly,
    effectiveRate,
    nextEscalationDate: nextEsc.nextDate,
    nextEscalationUplift: nextEsc.upliftMonthly,
    nextEscalationRate: nextEsc.nextRate,
    daysToEscalation: nextEsc.daysUntil,
    daysToExpiry: timeline.daysToExpiry,
    termMonths: timeline.termMonths,
    remainingYears: timeline.remainingYears,
    latestNoticeDate: noticeExit.latestNoticeDate,
    earliestExitDate: noticeExit.earliestExitDate,
    depositRequired: depositMetrics.totalRequired,
    depositHeld: depositMetrics.totalHeld,
    depositShortfall: depositMetrics.shortfall,
    depositCoverMonths: depositMetrics.coverMonths,
    rentFreeDaysRemaining: rentFreeDays,
    expectedMonthlyTDS,
  };
}

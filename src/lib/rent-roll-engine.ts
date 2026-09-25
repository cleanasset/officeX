/**
 * OFFICEX Rent Roll Calculation Engine
 * Implements all 20 Business Rules (BR-01 through BR-20) from the Functional Specification.
 * High precision, zero external dependencies, server & client compatible.
 */

export interface LeaseCalculationInput {
  carpetArea?: number | null;
  chargeableArea: number;
  monthlyRent: number; // Base Rent monthly
  camRatePsf?: number | null;
  camMonthly?: number | null;
  utilityFixedMonthly?: number | null;
  parkingChargesMonthly?: number | null;
  signageChargesMonthly?: number | null;
  otherChargesMonthly?: number | null;
  securityDepositMonths?: number | null;
  securityDepositPaid?: number | null;
  escalationPct?: number | null;
  escalationFrequencyMonths?: number | null;
  startDate: string | Date;
  endDate: string | Date;
  lockInMonths?: number | null;
  gstRate?: number | null;
  tdsRate?: number | null;
}

export interface InvoiceCalculationInput {
  baseRent: number;
  camCharges?: number;
  utilityCharges?: number;
  otherCharges?: number;
  gstRate?: number; // default 18
  tdsRate?: number; // default 10
  amountPaid?: number;
  dueDate: string | Date;
}

export interface ExpenseSummaryInput {
  grossRevenue: number;
  expenses: Array<{
    amount: number;
    expenseCategory?: string;
    expenseDate?: string | Date;
  }>;
  propertyValue?: number;
}

export interface AgingInvoiceInput {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  invoiceDate: string | Date;
  dueDate: string | Date;
  grossTotal: number;
  tdsDeducted: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
}

// Helpers
export const round2 = (val: number): number => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

export const parseDate = (d: string | Date): Date => {
  if (d instanceof Date) return d;
  return new Date(d);
};

export const diffInDays = (d1: Date, d2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((d1.getTime() - d2.getTime()) / oneDay);
};

export const diffInMonths = (future: Date, current: Date): number => {
  let months = (future.getFullYear() - current.getFullYear()) * 12;
  months -= current.getMonth();
  months += future.getMonth();
  const dayDiff = future.getDate() - current.getDate();
  return Math.max(0, months + (dayDiff / 30));
};

export const addMonthsToDate = (d: Date, months: number): Date => {
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  return result;
};

// ==========================================
// BR-01: Base Rent PSF Calculation
// ==========================================
export function calculateBaseRentPsf(monthlyRent: number, chargeableArea: number): number {
  if (!chargeableArea || chargeableArea <= 0) return 0;
  return round2(monthlyRent / chargeableArea);
}

// ==========================================
// BR-02: Total Monthly Gross Calculation
// ==========================================
export function calculateTotalMonthlyGross(input: {
  monthlyRent: number;
  camMonthly?: number;
  utilityFixedMonthly?: number;
  parkingChargesMonthly?: number;
  signageChargesMonthly?: number;
  otherChargesMonthly?: number;
}): number {
  const base = input.monthlyRent || 0;
  const cam = input.camMonthly || 0;
  const util = input.utilityFixedMonthly || 0;
  const parking = input.parkingChargesMonthly || 0;
  const signage = input.signageChargesMonthly || 0;
  const other = input.otherChargesMonthly || 0;
  return round2(base + cam + util + parking + signage + other);
}

// ==========================================
// BR-03: Annual Rent Gross Calculation
// ==========================================
export function calculateAnnualRentGross(totalMonthlyGross: number): number {
  return round2((totalMonthlyGross || 0) * 12);
}

// ==========================================
// BR-04: CAM Monthly Calculation
// ==========================================
export function calculateCamMonthly(chargeableArea: number, camRatePsf: number): number {
  return round2((chargeableArea || 0) * (camRatePsf || 0));
}

// ==========================================
// BR-05: Security Deposit Calculation
// ==========================================
export function calculateSecurityDeposit(monthlyRent: number, months: number = 6): number {
  return round2((monthlyRent || 0) * (months || 6));
}

// ==========================================
// BR-06: Security Deposit Shortfall
// ==========================================
export function calculateDepositShortfall(depositRequired: number, depositPaid: number): {
  shortfall: number;
  hasShortfall: boolean;
  compliancePct: number;
} {
  const req = depositRequired || 0;
  const paid = depositPaid || 0;
  const shortfall = round2(Math.max(0, req - paid));
  const compliancePct = req > 0 ? round2(Math.min(100, (paid / req) * 100)) : 100;
  return {
    shortfall,
    hasShortfall: shortfall > 0,
    compliancePct,
  };
}

// ==========================================
// BR-07: Escalation Rent Calculation
// ==========================================
export function calculateEscalationRent(previousRent: number, escalationPct: number): {
  previousRent: number;
  escalationPct: number;
  calculatedIncrease: number;
  newRent: number;
} {
  const prev = previousRent || 0;
  const pct = escalationPct || 0;
  const calculatedIncrease = round2(prev * (pct / 100));
  const newRent = round2(prev + calculatedIncrease);
  return {
    previousRent: prev,
    escalationPct: pct,
    calculatedIncrease,
    newRent,
  };
}

// ==========================================
// BR-08: Escalation Date Progression
// ==========================================
export function getNextEscalationDate(startDate: string | Date, frequencyMonths: number = 12, referenceDate: Date = new Date()): Date {
  let escDate = parseDate(startDate);
  const freq = frequencyMonths || 12;

  while (escDate <= referenceDate) {
    escDate = addMonthsToDate(escDate, freq);
  }
  return escDate;
}

// ==========================================
// BR-09: Lock-In Status & Expiry
// ==========================================
export function calculateLockInStatus(startDate: string | Date, lockInMonths: number = 36, referenceDate: Date = new Date()): {
  lockInEndDate: Date;
  isLockInActive: boolean;
  remainingLockInDays: number;
} {
  const start = parseDate(startDate);
  const lockInEndDate = addMonthsToDate(start, lockInMonths || 36);
  const diffDays = diffInDays(lockInEndDate, referenceDate);
  const isLockInActive = diffDays > 0;

  return {
    lockInEndDate,
    isLockInActive,
    remainingLockInDays: Math.max(0, diffDays),
  };
}

// ==========================================
// BR-10: Lease Expiry / Notice Pipeline Status
// ==========================================
export type ExpiryBucket = "expired" | "critical_30" | "warning_60" | "approaching_90" | "active";

export function calculateExpiryPipeline(expiryDate: string | Date, referenceDate: Date = new Date()): {
  daysToExpiry: number;
  bucket: ExpiryBucket;
  isExpired: boolean;
  requiresNotice: boolean;
} {
  const exp = parseDate(expiryDate);
  const daysToExpiry = diffInDays(exp, referenceDate);

  let bucket: ExpiryBucket = "active";
  if (daysToExpiry < 0) {
    bucket = "expired";
  } else if (daysToExpiry <= 30) {
    bucket = "critical_30";
  } else if (daysToExpiry <= 60) {
    bucket = "warning_60";
  } else if (daysToExpiry <= 90) {
    bucket = "approaching_90";
  }

  return {
    daysToExpiry,
    bucket,
    isExpired: daysToExpiry < 0,
    requiresNotice: daysToExpiry >= 0 && daysToExpiry <= 90,
  };
}

// ==========================================
// BR-11: Weighted Average Lease Expiry (WALE / WALT)
// ==========================================
export function calculateWALT(leases: Array<{
  chargeableArea?: number | null;
  monthlyRent?: number | null;
  expiryDate: string | Date;
  status?: string;
}>, referenceDate: Date = new Date()): {
  waltByAreaMonths: number;
  waltByAreaYears: number;
  waltByRevenueMonths: number;
  waltByRevenueYears: number;
  activeLeasesCount: number;
} {
  let totalAreaMonths = 0;
  let totalArea = 0;
  let totalRevenueMonths = 0;
  let totalRevenue = 0;
  let activeCount = 0;

  for (const l of leases) {
    if (l.status && ["expired", "terminated"].includes(l.status.toLowerCase())) {
      continue;
    }
    const exp = parseDate(l.expiryDate);
    const remainingMonths = diffInMonths(exp, referenceDate);
    if (remainingMonths <= 0) continue;

    const area = Number(l.chargeableArea || 0);
    const rev = Number(l.monthlyRent || 0);

    if (area > 0) {
      totalAreaMonths += remainingMonths * area;
      totalArea += area;
    }
    if (rev > 0) {
      totalRevenueMonths += remainingMonths * rev;
      totalRevenue += rev;
    }
    activeCount++;
  }

  const waltByAreaMonths = totalArea > 0 ? round2(totalAreaMonths / totalArea) : 0;
  const waltByRevenueMonths = totalRevenue > 0 ? round2(totalRevenueMonths / totalRevenue) : 0;

  return {
    waltByAreaMonths,
    waltByAreaYears: round2(waltByAreaMonths / 12),
    waltByRevenueMonths,
    waltByRevenueYears: round2(waltByRevenueMonths / 12),
    activeLeasesCount: activeCount,
  };
}

// ==========================================
// BR-12: Occupancy Rate & Vacancy
// ==========================================
export function calculateOccupancy(totalAreaSqft: number, occupiedAreaSqft: number): {
  totalArea: number;
  occupiedArea: number;
  vacantArea: number;
  occupancyPct: number;
  vacancyPct: number;
} {
  const total = totalAreaSqft || 0;
  const occupied = occupiedAreaSqft || 0;
  const vacant = Math.max(0, total - occupied);
  const occupancyPct = total > 0 ? round2((occupied / total) * 100) : 0;
  const vacancyPct = total > 0 ? round2(100 - occupancyPct) : 0;

  return {
    totalArea: total,
    occupiedArea: occupied,
    vacantArea: vacant,
    occupancyPct,
    vacancyPct,
  };
}

// ==========================================
// BR-13 & BR-14 & BR-15: Complete Invoice Lifecycle Engine
// ==========================================
export function calculateInvoice(input: InvoiceCalculationInput, referenceDate: Date = new Date()): {
  baseRent: number;
  camCharges: number;
  utilityCharges: number;
  otherCharges: number;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  grossTotal: number;
  tdsRate: number;
  tdsDeducted: number;
  netPayable: number;
  amountPaid: number;
  balanceDue: number;
  status: "paid" | "partially_paid" | "overdue" | "issued";
  daysOverdue: number;
} {
  const base = input.baseRent || 0;
  const cam = input.camCharges || 0;
  const util = input.utilityCharges || 0;
  const other = input.otherCharges || 0;
  const subtotal = round2(base + cam + util + other);

  const gstRate = input.gstRate !== undefined ? input.gstRate : 18;
  const gstAmount = round2(subtotal * (gstRate / 100));
  const grossTotal = round2(subtotal + gstAmount);

  const tdsRate = input.tdsRate !== undefined ? input.tdsRate : 10;
  // TDS applies to base rent under Indian Income Tax Act Sec 194I
  const tdsDeducted = round2(base * (tdsRate / 100));
  const netPayable = round2(grossTotal - tdsDeducted);

  const amountPaid = input.amountPaid || 0;
  const balanceDue = round2(Math.max(0, netPayable - amountPaid));

  const due = parseDate(input.dueDate);
  const daysDiff = diffInDays(referenceDate, due);
  const daysOverdue = Math.max(0, daysDiff);

  let status: "paid" | "partially_paid" | "overdue" | "issued" = "issued";
  if (balanceDue <= 0.01) {
    status = "paid";
  } else if (amountPaid > 0) {
    status = "partially_paid";
  } else if (daysOverdue > 0) {
    status = "overdue";
  }

  return {
    baseRent: base,
    camCharges: cam,
    utilityCharges: util,
    otherCharges: other,
    subtotal,
    gstRate,
    gstAmount,
    grossTotal,
    tdsRate,
    tdsDeducted,
    netPayable,
    amountPaid,
    balanceDue,
    status,
    daysOverdue,
  };
}

// ==========================================
// BR-16: Accounts Receivable Aging Buckets
// ==========================================
export interface AgingBucketSummary {
  current: number;       // not overdue
  bucket0to30: number;   // 1-30 days
  bucket31to60: number;  // 31-60 days
  bucket61to90: number;  // 61-90 days
  bucket90Plus: number;  // >90 days
  totalOutstanding: number;
  invoicesCount: number;
}

export function calculateAgingBuckets(
  invoices: AgingInvoiceInput[],
  referenceDate: Date = new Date()
): AgingBucketSummary {
  const summary: AgingBucketSummary = {
    current: 0,
    bucket0to30: 0,
    bucket31to60: 0,
    bucket61to90: 0,
    bucket90Plus: 0,
    totalOutstanding: 0,
    invoicesCount: 0,
  };

  for (const inv of invoices) {
    const balance = inv.balanceDue || 0;
    if (balance <= 0) continue;

    summary.totalOutstanding = round2(summary.totalOutstanding + balance);
    summary.invoicesCount++;

    const due = parseDate(inv.dueDate);
    const overdueDays = diffInDays(referenceDate, due);

    if (overdueDays <= 0) {
      summary.current = round2(summary.current + balance);
    } else if (overdueDays <= 30) {
      summary.bucket0to30 = round2(summary.bucket0to30 + balance);
    } else if (overdueDays <= 60) {
      summary.bucket31to60 = round2(summary.bucket31to60 + balance);
    } else if (overdueDays <= 90) {
      summary.bucket61to90 = round2(summary.bucket61to90 + balance);
    } else {
      summary.bucket90Plus = round2(summary.bucket90Plus + balance);
    }
  }

  return summary;
}

// ==========================================
// BR-17: Net Operating Income (NOI) & Operating Expense Ratio (OER)
// ==========================================
export function calculateNOI(input: {
  grossRevenue: number;
  totalExpenses: number;
}): {
  grossRevenue: number;
  totalExpenses: number;
  noi: number;
  oerPct: number;
} {
  const gross = input.grossRevenue || 0;
  const exp = input.totalExpenses || 0;
  const noi = round2(gross - exp);
  const oerPct = gross > 0 ? round2((exp / gross) * 100) : 0;

  return {
    grossRevenue: gross,
    totalExpenses: exp,
    noi,
    oerPct,
  };
}

// ==========================================
// BR-18: Yield / Capitalization Rate (Cap Rate)
// ==========================================
export function calculateCapRate(annualNOI: number, propertyValue: number): {
  annualNOI: number;
  propertyValue: number;
  capRatePct: number;
} {
  const noi = annualNOI || 0;
  const val = propertyValue || 0;
  const capRatePct = val > 0 ? round2((noi / val) * 100) : 0;

  return {
    annualNOI: noi,
    propertyValue: val,
    capRatePct,
  };
}

// ==========================================
// BR-19: 12-Month Revenue & Escalation Forecast Engine
// ==========================================
export interface MonthlyForecastItem {
  monthIndex: number; // 0 to 11
  monthLabel: string; // "Apr 2026", "May 2026", etc.
  projectedBaseRent: number;
  projectedCam: number;
  projectedOther: number;
  projectedGross: number;
  activeLeasesCount: number;
  escalationsTriggered: number;
  expirationsTriggered: number;
}

export function generate12MonthForecast(leases: Array<{
  monthlyRent: number;
  camMonthly?: number;
  otherChargesMonthly?: number;
  startDate: string | Date;
  expiryDate: string | Date;
  escalationPct?: number;
  escalationFrequencyMonths?: number;
  nextEscalationDate?: string | Date;
  status?: string;
}>, startDate: Date = new Date()): MonthlyForecastItem[] {
  const forecast: MonthlyForecastItem[] = [];

  for (let m = 0; m < 12; m++) {
    const targetMonthDate = addMonthsToDate(startDate, m);
    const monthLabel = targetMonthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    let monthBase = 0;
    let monthCam = 0;
    let monthOther = 0;
    let activeCount = 0;
    let escCount = 0;
    let expCount = 0;

    for (const l of leases) {
      if (l.status && ["expired", "terminated"].includes(l.status.toLowerCase())) {
        continue;
      }

      const lStart = parseDate(l.startDate);
      const lEnd = parseDate(l.expiryDate);

      // Check if active in this target month
      if (targetMonthDate >= lStart && targetMonthDate <= lEnd) {
        activeCount++;
        let rent = Number(l.monthlyRent || 0);

        // Check if next escalation has occurred on or before target month
        if (l.nextEscalationDate) {
          const escDate = parseDate(l.nextEscalationDate);
          if (targetMonthDate >= escDate && l.escalationPct) {
            rent = round2(rent * (1 + (l.escalationPct / 100)));
            if (targetMonthDate.getMonth() === escDate.getMonth() && targetMonthDate.getFullYear() === escDate.getFullYear()) {
              escCount++;
            }
          }
        }

        monthBase += rent;
        monthCam += Number(l.camMonthly || 0);
        monthOther += Number(l.otherChargesMonthly || 0);
      } else if (
        targetMonthDate > lEnd &&
        targetMonthDate.getMonth() === lEnd.getMonth() &&
        targetMonthDate.getFullYear() === lEnd.getFullYear()
      ) {
        expCount++;
      }
    }

    const projectedGross = round2(monthBase + monthCam + monthOther);

    forecast.push({
      monthIndex: m,
      monthLabel,
      projectedBaseRent: round2(monthBase),
      projectedCam: round2(monthCam),
      projectedOther: round2(monthOther),
      projectedGross,
      activeLeasesCount: activeCount,
      escalationsTriggered: escCount,
      expirationsTriggered: expCount,
    });
  }

  return forecast;
}

// ==========================================
// BR-20: Proration Calculation (Partial Month)
// ==========================================
export function calculateProratedRent(
  monthlyRent: number,
  year: number,
  month: number, // 0-indexed (0=Jan)
  startDay: number = 1,
  endDay?: number
): {
  daysInMonth: number;
  activeDays: number;
  dailyRate: number;
  proratedRent: number;
} {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const effectiveEnd = endDay ? Math.min(daysInMonth, endDay) : daysInMonth;
  const activeDays = Math.max(0, effectiveEnd - startDay + 1);
  const dailyRate = monthlyRent / daysInMonth;
  const proratedRent = round2(dailyRate * activeDays);

  return {
    daysInMonth,
    activeDays,
    dailyRate: round2(dailyRate),
    proratedRent,
  };
}

// ==========================================
// Complete Comprehensive Master Summary
// Computes all 39 metrics for a single lease
// ==========================================
export function computeFullLeaseSummary(input: LeaseCalculationInput) {
  const carpetArea = Number(input.carpetArea || 0);
  const chargeableArea = Number(input.chargeableArea || 0);
  const monthlyRent = Number(input.monthlyRent || 0);

  const baseRentPsf = calculateBaseRentPsf(monthlyRent, chargeableArea);
  const camRatePsf = Number(input.camRatePsf || 0);
  const camMonthly = input.camMonthly !== undefined && input.camMonthly !== null ? Number(input.camMonthly) : calculateCamMonthly(chargeableArea, camRatePsf);
  const utilityFixedMonthly = Number(input.utilityFixedMonthly || 0);
  const parkingChargesMonthly = Number(input.parkingChargesMonthly || 0);
  const signageChargesMonthly = Number(input.signageChargesMonthly || 0);
  const otherChargesMonthly = Number(input.otherChargesMonthly || 0);

  const totalMonthlyGross = calculateTotalMonthlyGross({
    monthlyRent,
    camMonthly,
    utilityFixedMonthly,
    parkingChargesMonthly,
    signageChargesMonthly,
    otherChargesMonthly,
  });

  const annualRentGross = calculateAnnualRentGross(totalMonthlyGross);

  const securityDepositMonths = Number(input.securityDepositMonths || 6);
  const securityDepositRequired = calculateSecurityDeposit(monthlyRent, securityDepositMonths);
  const securityDepositPaid = Number(input.securityDepositPaid || 0);
  const depositAnalysis = calculateDepositShortfall(securityDepositRequired, securityDepositPaid);

  const escalationPct = Number(input.escalationPct || 5);
  const escalationFrequencyMonths = Number(input.escalationFrequencyMonths || 12);
  const nextEscalationDate = getNextEscalationDate(input.startDate, escalationFrequencyMonths);
  const nextEscalationDetail = calculateEscalationRent(monthlyRent, escalationPct);

  const lockInMonths = Number(input.lockInMonths || 36);
  const lockInAnalysis = calculateLockInStatus(input.startDate, lockInMonths);

  const expiryAnalysis = calculateExpiryPipeline(input.endDate);

  return {
    carpetArea,
    chargeableArea,
    baseRentMonthly: monthlyRent,
    baseRentPsf,
    camRatePsf,
    camMonthly,
    utilityFixedMonthly,
    parkingChargesMonthly,
    signageChargesMonthly,
    otherChargesMonthly,
    totalMonthlyGross,
    annualRentGross,
    securityDepositMonths,
    securityDepositRequired,
    securityDepositPaid,
    depositShortfall: depositAnalysis.shortfall,
    depositCompliancePct: depositAnalysis.compliancePct,
    escalationPct,
    escalationFrequencyMonths,
    nextEscalationDate,
    nextEscalatedRent: nextEscalationDetail.newRent,
    lockInMonths,
    lockInEndDate: lockInAnalysis.lockInEndDate,
    isLockInActive: lockInAnalysis.isLockInActive,
    remainingLockInDays: lockInAnalysis.remainingLockInDays,
    daysToExpiry: expiryAnalysis.daysToExpiry,
    expiryBucket: expiryAnalysis.bucket,
    requiresNotice: expiryAnalysis.requiresNotice,
  };
}

// ==========================================
// BR-21: GST Place of Supply Engine (§4.8, §4.5)
// ==========================================
export interface TaxBreakdown {
  isInterState: boolean;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGstAmount: number;
}

export function calculatePlaceOfSupplyTax(
  taxableAmount: number,
  supplierStateCode: string,
  recipientStateCode: string,
  gstRate: number = 18
): TaxBreakdown {
  const isInterState = supplierStateCode && recipientStateCode && supplierStateCode.trim() !== recipientStateCode.trim();
  if (isInterState) {
    const igstAmount = round2((taxableAmount * gstRate) / 100);
    return {
      isInterState: true,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRate,
      igstAmount,
      totalGstAmount: igstAmount
    };
  } else {
    const halfRate = gstRate / 2;
    const cgstAmount = round2((taxableAmount * halfRate) / 100);
    const sgstAmount = round2((taxableAmount * halfRate) / 100);
    return {
      isInterState: false,
      cgstRate: halfRate,
      cgstAmount,
      sgstRate: halfRate,
      sgstAmount,
      igstRate: 0,
      igstAmount: 0,
      totalGstAmount: round2(cgstAmount + sgstAmount)
    };
  }
}

// ==========================================
// BR-22: Stepped Rent Escalation Generator (§4.7, RR-ESC-01)
// ==========================================
export interface ComputedRentStep {
  stepNumber: number;
  effectiveDate: string;
  baseRatePsf: number;
  monthlyBaseRent: number;
  escalationPct: number;
  status: "scheduled" | "applied";
}

export function generateContractRentSteps(
  startDateStr: string,
  endDateStr: string,
  initialBaseRatePsf: number,
  chargeableArea: number,
  escalationPct: number = 15,
  frequencyMonths: number = 36
): ComputedRentStep[] {
  const steps: ComputedRentStep[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const totalMonths = diffInMonths(end, start);

  let currentRate = initialBaseRatePsf;
  let currentRent = round2(currentRate * chargeableArea);
  let stepNum = 1;

  steps.push({
    stepNumber: stepNum,
    effectiveDate: start.toISOString().split("T")[0],
    baseRatePsf: currentRate,
    monthlyBaseRent: currentRent,
    escalationPct: 0,
    status: "applied"
  });

  let nextStepMonth = frequencyMonths;
  while (nextStepMonth < totalMonths) {
    stepNum++;
    const stepDate = addMonthsToDate(start, nextStepMonth);
    if (stepDate >= end) break;

    currentRate = round2(currentRate * (1 + escalationPct / 100));
    currentRent = round2(currentRate * chargeableArea);

    steps.push({
      stepNumber: stepNum,
      effectiveDate: stepDate.toISOString().split("T")[0],
      baseRatePsf: currentRate,
      monthlyBaseRent: currentRent,
      escalationPct,
      status: stepDate <= new Date() ? "applied" : "scheduled"
    });

    nextStepMonth += frequencyMonths;
  }

  return steps;
}

// ==========================================
// BR-23: Payment Sub-ledger Allocation Engine (RR-PAY-04)
// Priority: Taxes -> Base Rent -> CAM -> Other
// ==========================================
export interface AllocationResult {
  allocatedBaseRent: number;
  allocatedCam: number;
  allocatedGst: number;
  allocatedOther: number;
  totalAllocated: number;
  unallocatedRemaining: number;
}

export function allocatePaymentToInvoice(
  amountReceived: number,
  invoice: {
    baseRent: number;
    camCharges: number;
    gstAmount: number;
    otherCharges: number;
    balanceDue: number;
  }
): AllocationResult {
  let remaining = Math.min(amountReceived, invoice.balanceDue);
  const unallocatedRemaining = Math.max(0, amountReceived - invoice.balanceDue);

  // 1. Allocate GST first
  const allocatedGst = Math.min(remaining, invoice.gstAmount);
  remaining -= allocatedGst;

  // 2. Allocate Base Rent
  const allocatedBaseRent = Math.min(remaining, invoice.baseRent);
  remaining -= allocatedBaseRent;

  // 3. Allocate CAM
  const allocatedCam = Math.min(remaining, invoice.camCharges);
  remaining -= allocatedCam;

  // 4. Allocate Other
  const allocatedOther = Math.min(remaining, invoice.otherCharges);
  remaining -= allocatedOther;

  const totalAllocated = round2(allocatedGst + allocatedBaseRent + allocatedCam + allocatedOther);

  return {
    allocatedBaseRent,
    allocatedCam,
    allocatedGst,
    allocatedOther,
    totalAllocated,
    unallocatedRemaining: round2(unallocatedRemaining)
  };
}

// ==========================================
// BR-24: Monthly Owner Statement Calculation (RR-OPR-01)
// ==========================================
export interface OwnerStatementResult {
  grossBilled: number;
  totalCollected: number;
  totalArrears: number;
  operatorManagementFee: number;
  reimbursableExpenses: number;
  netRemittanceAmount: number;
}

export function calculateOwnerStatement(
  grossBilled: number,
  totalCollected: number,
  totalArrears: number,
  feeModel: "pct_collections" | "flat_monthly" | "per_sqft",
  feeRate: number,
  totalArea: number = 0,
  reimbursableExpenses: number = 0
): OwnerStatementResult {
  let operatorManagementFee = 0;
  if (feeModel === "pct_collections") {
    operatorManagementFee = round2((totalCollected * feeRate) / 100);
  } else if (feeModel === "per_sqft") {
    operatorManagementFee = round2(totalArea * feeRate);
  } else {
    operatorManagementFee = round2(feeRate);
  }

  const netRemittanceAmount = round2(Math.max(0, totalCollected - operatorManagementFee - reimbursableExpenses));

  return {
    grossBilled,
    totalCollected,
    totalArrears,
    operatorManagementFee,
    reimbursableExpenses,
    netRemittanceAmount
  };
}

// ==========================================
// BR-25: Flex Centre Contribution & Break-even P&L (RR-FLX-08..10, F-16, F-23, F-24)
// ==========================================
export interface FlexMemberInput {
  memberName: string;
  planName: string;
  billingBasis: "contracted" | "occupied" | "minimum_commitment" | "hybrid";
  contractedSeats: number;
  minimumSeats?: number;
  occupiedSeats: number;
  ratePerSeat: number;
  billableSeats: number;
  monthlyAmount: number;
}

export interface FlexCentrePnLResult {
  totalMemberRevenue: number;
  seatRevenue: number;
  extrasRevenue: number;
  headLeaseRentPayable: number;
  landlordCamPayable: number;
  totalDirectOpex: number;
  centreContributionMargin: number; // Formula F-23
  contributionMarginPct: number;
  seatCapacity: number;
  totalOccupiedSeats: number;
  seatOccupancyPct: number; // Formula F-16
  revPAS: number; // Revenue per occupied seat
  breakEvenOccupancyPct: number; // Formula F-24
}

export function calculateFlexCentrePnL(
  members: FlexMemberInput[],
  extrasRevenue: number, // meeting rooms + parking
  headLeaseRentPayable: number,
  landlordCamPayable: number,
  directOpex: number,
  seatCapacity: number
): FlexCentrePnLResult {
  const seatRevenue = round2(members.reduce((acc, m) => acc + (m.monthlyAmount || 0), 0));
  const totalMemberRevenue = round2(seatRevenue + extrasRevenue);
  const totalDirectCosts = round2(headLeaseRentPayable + landlordCamPayable + directOpex);
  
  // Formula F-23: Centre Contribution = Member Revenue - Head-Lease Rent - CAM/Utilities Payable - Centre Opex
  const centreContributionMargin = round2(totalMemberRevenue - totalDirectCosts);
  const contributionMarginPct = totalMemberRevenue > 0 ? round2((centreContributionMargin / totalMemberRevenue) * 100) : 0;
  
  const totalOccupiedSeats = members.reduce((acc, m) => acc + (m.occupiedSeats || 0), 0);
  // Formula F-16: Seat Occupancy = Occupied Seats / Total Seat Capacity
  const seatOccupancyPct = seatCapacity > 0 ? round2((totalOccupiedSeats / seatCapacity) * 100) : 0;
  
  const revPAS = totalOccupiedSeats > 0 ? round2(totalMemberRevenue / totalOccupiedSeats) : 0;
  
  // Formula F-24: Break-even seat occupancy = (Head-Lease Rent + Payables + Opex) / (Average Revenue per Occupied Seat * Seat Capacity)
  const breakEvenOccupancyPct = (revPAS > 0 && seatCapacity > 0)
    ? round2((totalDirectCosts / (revPAS * seatCapacity)) * 100)
    : 0;

  return {
    totalMemberRevenue,
    seatRevenue,
    extrasRevenue,
    headLeaseRentPayable,
    landlordCamPayable,
    totalDirectOpex: directOpex,
    centreContributionMargin,
    contributionMarginPct,
    seatCapacity,
    totalOccupiedSeats,
    seatOccupancyPct,
    revPAS,
    breakEvenOccupancyPct
  };
}

// ==========================================
// BR-26: CAM Pool Annual True-Up Engine (RR-FMC-04..06, Formula F-22)
// Formula F-22: Occupant Share of Actual CAM - CAM Billed to Occupant = Debit (+) or Credit (-) note
// ==========================================
export interface CamTenantTrueUpInput {
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  chargeableArea: number;
  advanceCamBilled: number;
}

export interface CamTenantTrueUpResult {
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  chargeableArea: number;
  areaSharePct: number;
  proportionalActualCost: number;
  advanceCamBilled: number;
  varianceAmount: number; // positive = under-billed (Debit note), negative = over-billed (Credit note)
  action: "DEBIT_NOTE" | "CREDIT_NOTE" | "SETTLED";
  noteAmount: number;
}

export interface CamPoolTrueUpSummary {
  propertyId: string;
  propertyName: string;
  fyYear: string;
  totalBuildingArea: number;
  totalActualCamCost: number;
  totalAdvanceCamBilled: number;
  netTrueUpVariance: number;
  totalDebitNotesAmount: number;
  totalCreditNotesAmount: number;
  tenantResults: CamTenantTrueUpResult[];
}

export function calculateCamPoolTrueUp(
  propertyId: string,
  propertyName: string,
  fyYear: string,
  totalBuildingArea: number,
  totalActualCamCost: number,
  tenants: CamTenantTrueUpInput[]
): CamPoolTrueUpSummary {
  let totalAdvanceCamBilled = 0;
  let totalDebitNotesAmount = 0;
  let totalCreditNotesAmount = 0;

  const tenantResults: CamTenantTrueUpResult[] = tenants.map((t) => {
    totalAdvanceCamBilled += (t.advanceCamBilled || 0);
    const areaSharePct = totalBuildingArea > 0 ? (t.chargeableArea / totalBuildingArea) : 0;
    const proportionalActualCost = round2(totalActualCamCost * areaSharePct);
    const varianceAmount = round2(proportionalActualCost - t.advanceCamBilled);

    let action: "DEBIT_NOTE" | "CREDIT_NOTE" | "SETTLED" = "SETTLED";
    let noteAmount = 0;

    if (varianceAmount > 0.5) {
      action = "DEBIT_NOTE";
      noteAmount = varianceAmount;
      totalDebitNotesAmount += noteAmount;
    } else if (varianceAmount < -0.5) {
      action = "CREDIT_NOTE";
      noteAmount = Math.abs(varianceAmount);
      totalCreditNotesAmount += noteAmount;
    }

    return {
      tenantId: t.tenantId,
      tenantName: t.tenantName,
      unitNumber: t.unitNumber,
      chargeableArea: t.chargeableArea,
      areaSharePct: round2(areaSharePct * 100),
      proportionalActualCost,
      advanceCamBilled: t.advanceCamBilled,
      varianceAmount,
      action,
      noteAmount: round2(noteAmount)
    };
  });

  const netTrueUpVariance = round2(totalActualCamCost - totalAdvanceCamBilled);

  return {
    propertyId,
    propertyName,
    fyYear,
    totalBuildingArea,
    totalActualCamCost: round2(totalActualCamCost),
    totalAdvanceCamBilled: round2(totalAdvanceCamBilled),
    netTrueUpVariance,
    totalDebitNotesAmount: round2(totalDebitNotesAmount),
    totalCreditNotesAmount: round2(totalCreditNotesAmount),
    tenantResults
  };
}

// ==========================================
// BR-27: Tally Prime XML Voucher Generator (RR-INT-01, OI-5)
// Generates standard Tally.ERP9 / Tally Prime <ENVELOPE> XML
// ==========================================
export function generateTallyPrimeXml(data: {
  companyName: string;
  invoices: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    tenantName: string;
    baseRent: number;
    camCharges: number;
    gstAmount: number;
    grossTotal: number;
    placeOfSupply?: string;
  }>;
  collections?: Array<{
    receiptNumber: string;
    paymentDate: string;
    tenantName: string;
    amountReceived: number;
    tdsDeducted: number;
    paymentMode: string;
    referenceNumber: string;
    bankAccount: string;
  }>;
  adjustmentNotes?: Array<{
    noteNumber: string;
    noteType: string;
    issuedDate: string;
    tenantName?: string;
    invoiceNumber?: string;
    amount: number;
    gstAmount: number;
    totalAdjustment: number;
    reason: string;
  }>;
}): string {
  const formatTallyDate = (dStr: string) => {
    const d = new Date(dStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${data.companyName || "OFFICEX Commercial Asset SPV"}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

  // 1. Sales Vouchers for Tax Invoices
  data.invoices.forEach((inv) => {
    const tallyDate = formatTallyDate(inv.invoiceDate);
    const halfGst = round2(inv.gstAmount / 2);

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${inv.invoiceNumber}</VOUCHERNUMBER>
            <REFERENCE>${inv.invoiceNumber}</REFERENCE>
            <PARTYLEDGERNAME>${inv.tenantName}</PARTYLEDGERNAME>
            <NARRATION>OFFICEX Commercial Rent Roll billing for ${inv.tenantName} - Inv #${inv.invoiceNumber}</NARRATION>
            
            <!-- Debit Sundry Debtors (Gross Amount) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${inv.tenantName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${inv.grossTotal.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <!-- Credit Base Rental Income -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Commercial Rental Income</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.baseRent.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;

    if (inv.camCharges > 0) {
      xml += `            <!-- Credit CAM Recoveries -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>CAM Recoveries</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.camCharges.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
    }

    if (inv.gstAmount > 0) {
      xml += `            <!-- Credit Output CGST 9% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${halfGst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <!-- Credit Output SGST 9% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${halfGst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
    }

    xml += `          </VOUCHER>
        </TALLYMESSAGE>
`;
  });

  // 2. Receipt Vouchers for Bank Collections
  if (data.collections) {
    data.collections.forEach((col) => {
      const tallyDate = formatTallyDate(col.paymentDate);
      xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${col.receiptNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${col.tenantName}</PARTYLEDGERNAME>
            <NARRATION>Payment received via ${col.paymentMode} Ref UTR: ${col.referenceNumber}</NARRATION>
            
            <!-- Debit Bank Escrow Ledger -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${col.bankAccount || "HDFC Bank Escrow A/c"}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${col.amountReceived.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;

      if (col.tdsDeducted > 0) {
        xml += `            <!-- Debit TDS Receivable u/s 194-I -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>TDS Receivable u/s 194-I</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${col.tdsDeducted.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
      }

      const totalTenantCredit = col.amountReceived + (col.tdsDeducted || 0);
      xml += `            <!-- Credit Sundry Debtors -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${col.tenantName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${totalTenantCredit.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`;
    });
  }

  // 3. Credit / Debit Notes
  if (data.adjustmentNotes) {
    data.adjustmentNotes.forEach((note) => {
      const tallyDate = formatTallyDate(note.issuedDate);
      const isCredit = note.noteType === "credit_note";
      const vchType = isCredit ? "Credit Note" : "Debit Note";
      const party = note.tenantName || "Commercial Tenant";
      const halfGst = round2(note.gstAmount / 2);

      xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${vchType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${note.noteNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${party}</PARTYLEDGERNAME>
            <NARRATION>${note.reason} - Ref: ${note.invoiceNumber || "General"}</NARRATION>
            
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${party}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${isCredit ? "No" : "Yes"}</ISDEEMEDPOSITIVE>
              <AMOUNT>${isCredit ? note.totalAdjustment.toFixed(2) : `-${note.totalAdjustment.toFixed(2)}`}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Rent Roll Adjustments</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${isCredit ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
              <AMOUNT>${isCredit ? `-${note.amount.toFixed(2)}` : note.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
      if (note.gstAmount > 0) {
        xml += `            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>GST Adjustment</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${isCredit ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
              <AMOUNT>${isCredit ? `-${(halfGst * 2).toFixed(2)}` : (halfGst * 2).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
      }
      xml += `          </VOUCHER>
        </TALLYMESSAGE>
`;
    });
  }

  xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return xml;
}



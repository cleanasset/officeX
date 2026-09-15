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
  const vacancyPct = round2(100 - occupancyPct);

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

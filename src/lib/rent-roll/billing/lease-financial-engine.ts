/**
 * Single-Source-of-Truth Lease Financial, Date & TDS Calculation Engine
 * Shared by Contract Creation Wizard (Step 3 Preview), POST /api/contracts, and Monthly Invoice Generation.
 * All date arithmetic uses explicit YYYY-MM-DD calendar components (timezone-agnostic / IST-safe).
 */

export function roundInr(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface YmdParts {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export function parseLocalYmd(ymd?: string | null): YmdParts | null {
  if (!ymd || typeof ymd !== "string") return null;
  const clean = ymd.trim().slice(0, 10);
  const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function formatYmd(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function daysInYearMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addDaysYmd(ymd: string, deltaDays: number): string {
  const parts = parseLocalYmd(ymd);
  if (!parts) return "";
  const dt = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + Math.trunc(deltaDays)));
  return formatYmd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function addMonthsYmd(ymd: string, monthsToAdd: number): string {
  const parts = parseLocalYmd(ymd);
  if (!parts) return "";
  const zeroMonth = parts.month - 1 + Math.trunc(monthsToAdd);
  const targetYear = parts.year + Math.floor(zeroMonth / 12);
  const targetMonth = ((zeroMonth % 12) + 12) % 12 + 1;
  const maxDay = daysInYearMonth(targetYear, targetMonth);
  const targetDay = Math.min(parts.day, maxDay);
  return formatYmd(targetYear, targetMonth, targetDay);
}

export function diffDaysInclusiveYmd(startYmd: string, endYmd: string): number {
  const s = parseLocalYmd(startYmd);
  const e = parseLocalYmd(endYmd);
  if (!s || !e) return 0;
  const sMs = Date.UTC(s.year, s.month - 1, s.day);
  const eMs = Date.UTC(e.year, e.month - 1, e.day);
  if (eMs < sMs) return 0;
  return Math.round((eMs - sMs) / 86400000) + 1;
}

export function formatDisplayDateInr(ymd?: string | null): string {
  const p = parseLocalYmd(ymd);
  if (!p) return "--";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(p.day).padStart(2, "0")} ${months[p.month - 1]} ${p.year}`;
}

export interface LeaseTenureBreakdown {
  valid: boolean;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  approxTotalMonths: number;
  exactMonths: number | null;
  label: string;
  shortNote: string | null;
  suggestedFullPeriodEndDate: string | null;
  suggestedFullYears: number | null;
  daysShortOfFullPeriod: number;
}

/**
 * Calculates exact inclusive lease tenure (e.g. 2026-11-01 to 2029-10-31 = 3 Years exact,
 * whereas 2026-11-01 to 2029-10-26 = 2 Years 11 Months 26 Days, 5 days short of 3 Years).
 */
export function calculateLeaseTenure(startYmd?: string, endYmd?: string): LeaseTenureBreakdown {
  const s = parseLocalYmd(startYmd);
  const e = parseLocalYmd(endYmd);
  if (!s || !e || !startYmd || !endYmd) {
    return {
      valid: false,
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      approxTotalMonths: 0,
      exactMonths: null,
      label: "",
      shortNote: null,
      suggestedFullPeriodEndDate: null,
      suggestedFullYears: null,
      daysShortOfFullPeriod: 0,
    };
  }
  const totalDays = diffDaysInclusiveYmd(startYmd, endYmd);
  if (totalDays <= 0) {
    return {
      valid: false,
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      approxTotalMonths: 0,
      exactMonths: null,
      label: "End Date must be on or after Start Date",
      shortNote: null,
      suggestedFullPeriodEndDate: null,
      suggestedFullYears: null,
      daysShortOfFullPeriod: 0,
    };
  }

  // Inclusive lease duration treats [start, end] as [start, end + 1 day)
  const exclusiveEndStr = addDaysYmd(endYmd, 1);
  const excl = parseLocalYmd(exclusiveEndStr)!;

  let years = excl.year - s.year;
  let months = excl.month - s.month;
  let days = excl.day - s.day;

  if (days < 0) {
    months -= 1;
    const prevMonth = excl.month === 1 ? 12 : excl.month - 1;
    const prevMonthYear = excl.month === 1 ? excl.year - 1 : excl.year;
    days += daysInYearMonth(prevMonthYear, prevMonth);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonthsFloor = years * 12 + months;
  const approxTotalMonths = Math.max(1, totalMonthsFloor + (days >= 15 ? 1 : 0));
  const exactMonths = days === 0 ? totalMonthsFloor : null;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Year" : "Years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "Month" : "Months"}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? "Day" : "Days"}`);

  const label =
    exactMonths !== null
      ? `${exactMonths} Months${years > 0 && months === 0 ? ` (${years} ${years === 1 ? "Year" : "Years"})` : ""}`
      : `${parts.join(" ")} (${totalDays.toLocaleString("en-IN")} Days)`;

  // Check if end date stops slightly short (1..20 days) of an exact annual anniversary
  let shortNote: string | null = null;
  let suggestedFullPeriodEndDate: string | null = null;
  let suggestedFullYears: number | null = null;
  let daysShortOfFullPeriod = 0;

  if (days > 0) {
    const candidateYears = months >= 11 ? years + 1 : null;
    if (candidateYears && candidateYears >= 1) {
      const exactFullEnd = addDaysYmd(addMonthsYmd(startYmd, candidateYears * 12), -1);
      const diff = diffDaysInclusiveYmd(endYmd, exactFullEnd) - 1;
      if (diff > 0 && diff <= 20) {
        suggestedFullPeriodEndDate = exactFullEnd;
        suggestedFullYears = candidateYears;
        daysShortOfFullPeriod = diff;
        shortNote = `${diff} ${diff === 1 ? "day" : "days"} short of exact ${candidateYears}-Year end date (${formatDisplayDateInr(exactFullEnd)})`;
      }
    }
  }

  return {
    valid: true,
    years,
    months,
    days,
    totalDays,
    approxTotalMonths,
    exactMonths,
    label,
    shortNote,
    suggestedFullPeriodEndDate,
    suggestedFullYears,
    daysShortOfFullPeriod,
  };
}

export type TdsPresetMode =
  | "rent_only_194i"
  | "standard_194i_194c"
  | "no_tds_exempt"
  | "individual_194ib"
  | "custom";

export interface TdsPolicyConfig {
  enabled: boolean;
  presetMode?: TdsPresetMode;
  rentRatePercent: number;
  camRatePercent: number;
  parkingRatePercent: number;
  utilityRatePercent: number;
  sectionNote?: string;
}

export const DEFAULT_TDS_POLICY: TdsPolicyConfig = {
  enabled: true,
  presetMode: "rent_only_194i",
  rentRatePercent: 10,
  camRatePercent: 0,
  parkingRatePercent: 0,
  utilityRatePercent: 0,
  sectionNote: "Sec 194-I (10% on Rent)",
};

export function normalizeTdsPolicy(policy?: Partial<TdsPolicyConfig> | null): TdsPolicyConfig {
  if (!policy) return { ...DEFAULT_TDS_POLICY };
  const enabled = policy.enabled !== false;
  if (!enabled) {
    return {
      enabled: false,
      presetMode: "no_tds_exempt",
      rentRatePercent: 0,
      camRatePercent: 0,
      parkingRatePercent: 0,
      utilityRatePercent: 0,
      sectionNote: policy.sectionNote || "No TDS / Exempt (0%)",
    };
  }
  const rentRatePercent = Math.min(100, Math.max(0, Number(policy.rentRatePercent ?? 10) || 0));
  const camRatePercent = Math.min(100, Math.max(0, Number(policy.camRatePercent ?? 0) || 0));
  const parkingRatePercent = Math.min(100, Math.max(0, Number(policy.parkingRatePercent ?? 0) || 0));
  const utilityRatePercent = Math.min(100, Math.max(0, Number(policy.utilityRatePercent ?? 0) || 0));
  return {
    enabled: true,
    presetMode: policy.presetMode || "rent_only_194i",
    rentRatePercent,
    camRatePercent,
    parkingRatePercent,
    utilityRatePercent,
    sectionNote: policy.sectionNote,
  };
}

export interface ContractFinancialPreviewInput {
  startDate?: string;
  endDate?: string;
  fitoutDays?: number;
  camPayableDuringFitout?: boolean;
  monthlyRent: number;
  camMonthly: number;
  carParkingMonthly: number;
  twoWheelerMonthly: number;
  fixedUtilityMonthly: number;
  securityDeposit: number;
  gstRatePercent?: number;
  tdsPolicy?: Partial<TdsPolicyConfig>;
  escalationPct?: number;
  escalationFrequency?: string;
  escalationStartDate?: string;
}

export interface EscalationProjectionRow {
  stepNo: number;
  effectiveDate: string;
  escalationPct: number;
  monthlyRent: number;
  monthlyGrossWithGst: number;
}

export interface ContractFinancialPreviewResult {
  rcdDate: string;
  fitoutDays: number;
  camPayableDuringFitout: boolean;
  tenure: LeaseTenureBreakdown;
  gstRatePercent: number;
  tdsPolicy: TdsPolicyConfig;
  steadyState: {
    baseRent: number;
    cam: number;
    parking: number;
    fixedUtility: number;
    subtotalExclGst: number;
    gstAmount: number;
    grossInclGst: number;
    tdsRent: number;
    tdsCam: number;
    tdsParking: number;
    tdsUtility: number;
    tdsTotal: number;
    netReceivable: number;
  };
  fitoutPhase: {
    active: boolean;
    fitoutEndDate: string;
    rcdDate: string;
    monthlyBaseRent: number;
    monthlyCam: number;
    monthlyParking: number;
    monthlySubtotalExclGst: number;
    monthlyGstAmount: number;
    monthlyGrossInclGst: number;
    monthlyTdsTotal: number;
    monthlyNetReceivable: number;
  };
  securityDeposit: number;
  escalationSchedule: EscalationProjectionRow[];
}

export function getCycleMonthsFromFrequency(freq?: string): number {
  const f = (freq || "").toLowerCase();
  if (f.includes("quarter")) return 3;
  if (f.includes("bi") || f.includes("24") || f.includes("2 year")) return 24;
  if (f.includes("tri") || f.includes("36") || f.includes("3 year")) return 36;
  return 12;
}

/**
 * Generates exact escalation step dates and compounded monthly rent rows using local YYYY-MM-DD arithmetic.
 */
export function buildEscalationSchedule(params: {
  startDate?: string;
  endDate?: string;
  baseMonthlyRent: number;
  escalationPct: number;
  escalationFrequency?: string;
  explicitFirstEscalationDate?: string;
  gstRatePercent?: number;
}): EscalationProjectionRow[] {
  const { startDate, endDate, baseMonthlyRent, escalationPct, escalationFrequency, explicitFirstEscalationDate } = params;
  const gstRate = params.gstRatePercent ?? 18;
  if (!startDate || !endDate || baseMonthlyRent <= 0 || escalationPct <= 0) return [];
  if (!parseLocalYmd(startDate) || !parseLocalYmd(endDate)) return [];

  const cycleMonths = getCycleMonthsFromFrequency(escalationFrequency);
  let nextDate =
    explicitFirstEscalationDate && parseLocalYmd(explicitFirstEscalationDate)
      ? explicitFirstEscalationDate.slice(0, 10)
      : addMonthsYmd(startDate, cycleMonths);

  const rows: EscalationProjectionRow[] = [];
  let currentRent = roundInr(baseMonthlyRent);
  let stepNo = 1;

  while (nextDate && nextDate <= endDate && stepNo <= 20) {
    currentRent = roundInr(currentRent * (1 + escalationPct / 100));
    rows.push({
      stepNo,
      effectiveDate: nextDate,
      escalationPct,
      monthlyRent: currentRent,
      monthlyGrossWithGst: roundInr(currentRent * (1 + gstRate / 100)),
    });
    stepNo += 1;
    nextDate = addMonthsYmd(nextDate, cycleMonths);
  }
  return rows;
}

export function computeContractFinancialSummary(
  input: ContractFinancialPreviewInput
): ContractFinancialPreviewResult {
  const gstRatePercent = input.gstRatePercent ?? 18;
  const fitoutDays = Math.max(0, Math.trunc(Number(input.fitoutDays) || 0));
  const camPayableDuringFitout = input.camPayableDuringFitout ?? false;
  const tdsPolicy = normalizeTdsPolicy(input.tdsPolicy);

  const baseRent = roundInr(Math.max(0, Number(input.monthlyRent) || 0));
  const cam = roundInr(Math.max(0, Number(input.camMonthly) || 0));
  const parking = roundInr(
    Math.max(0, (Number(input.carParkingMonthly) || 0) + (Number(input.twoWheelerMonthly) || 0))
  );
  const fixedUtility = roundInr(Math.max(0, Number(input.fixedUtilityMonthly) || 0));
  const securityDeposit = roundInr(Math.max(0, Number(input.securityDeposit) || 0));

  const subtotalExclGst = roundInr(baseRent + cam + parking + fixedUtility);
  const gstAmount = roundInr((subtotalExclGst * gstRatePercent) / 100);
  const grossInclGst = roundInr(subtotalExclGst + gstAmount);

  const tdsRent = tdsPolicy.enabled ? roundInr((baseRent * tdsPolicy.rentRatePercent) / 100) : 0;
  const tdsCam = tdsPolicy.enabled ? roundInr((cam * tdsPolicy.camRatePercent) / 100) : 0;
  const tdsParking = tdsPolicy.enabled ? roundInr((parking * tdsPolicy.parkingRatePercent) / 100) : 0;
  const tdsUtility = tdsPolicy.enabled ? roundInr((fixedUtility * tdsPolicy.utilityRatePercent) / 100) : 0;
  const tdsTotal = roundInr(tdsRent + tdsCam + tdsParking + tdsUtility);
  const netReceivable = Math.max(0, roundInr(grossInclGst - tdsTotal));

  const hasValidStart = Boolean(parseLocalYmd(input.startDate));
  const fitoutActive = fitoutDays > 0;
  const fitoutEndDate = hasValidStart && fitoutActive ? addDaysYmd(input.startDate!, fitoutDays - 1) : "";
  const rcdDate = hasValidStart ? (fitoutActive ? addDaysYmd(input.startDate!, fitoutDays) : input.startDate!) : "";

  const fitCam = fitoutActive && camPayableDuringFitout ? cam : 0;
  const fitSub = roundInr(fitCam);
  const fitGst = roundInr((fitSub * gstRatePercent) / 100);
  const fitGross = roundInr(fitSub + fitGst);
  const fitTds = tdsPolicy.enabled ? roundInr((fitCam * tdsPolicy.camRatePercent) / 100) : 0;
  const fitNet = Math.max(0, roundInr(fitGross - fitTds));

  const tenure = calculateLeaseTenure(input.startDate, input.endDate);
  const escalationSchedule = buildEscalationSchedule({
    startDate: input.startDate,
    endDate: input.endDate,
    baseMonthlyRent: baseRent,
    escalationPct: Number(input.escalationPct) || 0,
    escalationFrequency: input.escalationFrequency,
    explicitFirstEscalationDate: input.escalationStartDate,
    gstRatePercent,
  });

  return {
    rcdDate,
    fitoutDays,
    camPayableDuringFitout,
    tenure,
    gstRatePercent,
    tdsPolicy,
    steadyState: {
      baseRent,
      cam,
      parking,
      fixedUtility,
      subtotalExclGst,
      gstAmount,
      grossInclGst,
      tdsRent,
      tdsCam,
      tdsParking,
      tdsUtility,
      tdsTotal,
      netReceivable,
    },
    fitoutPhase: {
      active: fitoutActive,
      fitoutEndDate,
      rcdDate,
      monthlyBaseRent: 0,
      monthlyCam: fitCam,
      monthlyParking: 0,
      monthlySubtotalExclGst: fitSub,
      monthlyGstAmount: fitGst,
      monthlyGrossInclGst: fitGross,
      monthlyTdsTotal: fitTds,
      monthlyNetReceivable: fitNet,
    },
    securityDeposit,
    escalationSchedule,
  };
}

export interface PersistedContractFinancialMeta {
  tds_policy?: TdsPolicyConfig;
  fitout_days?: number;
  cam_payable_during_fitout?: boolean;
  rcd_date?: string;
  billing_entity?: string;
  payment_terms?: string;
  stamp_duty_sharing?: string;
  escalation_anchor?: "start" | "rcd";
  lock_in_months?: number;
  lock_in_end_date?: string;
}

export function parseContractFinancialMeta(raw?: string | null): PersistedContractFinancialMeta {
  if (!raw || typeof raw !== "string") return {};
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return {};
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function computeInvoiceDueDateYmd(
  periodStartYmd: string,
  paymentTerms?: string | null,
  fallbackNoticeDays?: number | null
): string {
  const parts = parseLocalYmd(periodStartYmd);
  if (!parts) return periodStartYmd;

  const terms = (paymentTerms || "").toLowerCase();
  const maxMonthDay = daysInYearMonth(parts.year, parts.month);

  if (terms.includes("1st") || terms.includes("1 of") || terms.includes("advance")) {
    return formatYmd(parts.year, parts.month, Math.min(1, maxMonthDay));
  }
  if (terms.includes("5th")) {
    return formatYmd(parts.year, parts.month, Math.min(5, maxMonthDay));
  }
  if (terms.includes("7th")) {
    return formatYmd(parts.year, parts.month, Math.min(7, maxMonthDay));
  }
  if (terms.includes("10th")) {
    return formatYmd(parts.year, parts.month, Math.min(10, maxMonthDay));
  }
  if (terms.includes("net 30") || terms.includes("30 days")) {
    return addDaysYmd(periodStartYmd, 30);
  }
  if (terms.includes("net 15") || terms.includes("15 days")) {
    return addDaysYmd(periodStartYmd, 15);
  }

  const dueDays = fallbackNoticeDays ? Math.min(30, Math.max(7, fallbackNoticeDays)) : 15;
  return addDaysYmd(periodStartYmd, dueDays);
}


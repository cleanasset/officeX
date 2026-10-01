/**
 * OFFICEX Visitor Management & Compliance Management Calculation Engine
 * Implements business rules BR-V01 to BR-V12 and BR-C01 to BR-C12
 * Specification Reference: OFFICEX-SCL-VC-IMP-001 / Version 1.0 (27-Aug-2026)
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: VISITOR MANAGEMENT RULES & FORMULAS (BR-V01 .. BR-V12)
// ═══════════════════════════════════════════════════════════════════════════

export interface VisitValidationParams {
  visitStart: string;
  visitEnd: string;
  approvalStatus: string;
  status: string;
  isBlacklisted: boolean;
  requiresApproval?: boolean;
  earlyArrivalGraceMinutes?: number; // default 30 mins
  lateArrivalGraceMinutes?: number;  // default 60 mins
  overstayGraceMinutes?: number;     // default 15 mins
}

export interface VisitCheckinEligibility {
  eligible: boolean;
  reason?: string;
  isEarly: boolean;
  isLate: boolean;
  isExpired: boolean;
}

/**
 * BR-V01 & BR-V04: Validate whether a visitor is eligible to check in
 */
export function evaluateCheckinEligibility(
  params: VisitValidationParams,
  currentTime: Date = new Date()
): VisitCheckinEligibility {
  const {
    visitStart,
    visitEnd,
    approvalStatus,
    status,
    isBlacklisted,
    requiresApproval = false,
    earlyArrivalGraceMinutes = 30,
    lateArrivalGraceMinutes = 60
  } = params;

  // BR-V10 & BR-V04: Watchlist match blocks entry
  if (isBlacklisted) {
    return {
      eligible: false,
      reason: "Visitor identity matches restricted watchlist (BR-V10). Access blocked.",
      isEarly: false,
      isLate: false,
      isExpired: false
    };
  }

  // Already checked in or checked out
  if (status === "checked_in") {
    return {
      eligible: false,
      reason: "Visitor is already checked in and inside premises.",
      isEarly: false,
      isLate: false,
      isExpired: false
    };
  }
  if (status === "checked_out") {
    return {
      eligible: false,
      reason: "Pass has already been used and visit is checked out.",
      isEarly: false,
      isLate: false,
      isExpired: true
    };
  }

  // BR-V02: Approval required
  if (requiresApproval && approvalStatus !== "approved") {
    return {
      eligible: false,
      reason: `Visit approval is pending or not granted (status: ${approvalStatus}).`,
      isEarly: false,
      isLate: false,
      isExpired: false
    };
  }

  const startTime = new Date(visitStart).getTime();
  const endTime = new Date(visitEnd).getTime();
  const now = currentTime.getTime();

  const earliestAllowed = startTime - earlyArrivalGraceMinutes * 60 * 1000;
  const latestAllowed = endTime;

  if (now < earliestAllowed) {
    return {
      eligible: false,
      reason: "Early arrival: Pass is not yet valid. Scheduled start time is in the future.",
      isEarly: true,
      isLate: false,
      isExpired: false
    };
  }

  if (now > latestAllowed) {
    return {
      eligible: false,
      reason: "Expired pass: Scheduled visit window has ended.",
      isEarly: false,
      isLate: false,
      isExpired: true
    };
  }

  const isLateArrival = now > startTime + lateArrivalGraceMinutes * 60 * 1000;

  return {
    eligible: true,
    isEarly: false,
    isLate: isLateArrival,
    isExpired: false
  };
}

/**
 * BR-V06: Overstay Detection
 * If current time exceeds visit_end plus grace period, status becomes Overstay
 */
export function isVisitOverstay(
  visitEnd: string,
  checkoutAt: string | null | undefined,
  graceMinutes: number = 15,
  currentTime: Date = new Date()
): boolean {
  if (checkoutAt) return false;
  const endTime = new Date(visitEnd).getTime();
  const threshold = endTime + graceMinutes * 60 * 1000;
  return currentTime.getTime() > threshold;
}

/**
 * BR-V07: Emergency Roll Call Reconciliation
 * Computes visitors currently inside premises and groups by Building / Floor / Zone
 */
export interface ActiveInsideVisitor {
  id: string;
  visitorName: string;
  company: string;
  hostName: string;
  tenantName: string;
  zone: string;
  checkinAt: string;
  visitEnd: string;
  evacuationStatus: "SAFE" | "UNACCOUNTED" | "MISSING";
  isOverstay: boolean;
}

export function computeEmergencyRollCall(
  visits: any[],
  graceMinutes: number = 15,
  currentTime: Date = new Date()
): {
  totalInside: number;
  safeCount: number;
  unaccountedCount: number;
  overstayCount: number;
  zoneBreakdown: Record<string, { total: number; safe: number; unaccounted: number }>;
  visitors: ActiveInsideVisitor[];
} {
  const inside = visits.filter(v => v.status === "checked_in" || (v.checkinAt && !v.checkoutAt));
  let safeCount = 0;
  let unaccountedCount = 0;
  let overstayCount = 0;
  const zoneBreakdown: Record<string, { total: number; safe: number; unaccounted: number }> = {};

  const mapped: ActiveInsideVisitor[] = inside.map(v => {
    const isOver = isVisitOverstay(v.visitEnd, v.checkoutAt, graceMinutes, currentTime);
    if (isOver) overstayCount++;

    const evacStatus = v.evacuationStatus === "SAFE" ? "SAFE" : "UNACCOUNTED";
    if (evacStatus === "SAFE") safeCount++;
    else unaccountedCount++;

    const zoneKey = v.zone || "Main Lobby";
    if (!zoneBreakdown[zoneKey]) {
      zoneBreakdown[zoneKey] = { total: 0, safe: 0, unaccounted: 0 };
    }
    zoneBreakdown[zoneKey].total++;
    if (evacStatus === "SAFE") zoneBreakdown[zoneKey].safe++;
    else zoneBreakdown[zoneKey].unaccounted++;

    return {
      id: v.id,
      visitorName: v.visitorName,
      company: v.company || "Independent",
      hostName: v.hostName || "Building Desk",
      tenantName: v.tenantName || "Campus",
      zone: zoneKey,
      checkinAt: v.checkinAt,
      visitEnd: v.visitEnd,
      evacuationStatus: evacStatus,
      isOverstay: isOver
    };
  });

  return {
    totalInside: inside.length,
    safeCount,
    unaccountedCount,
    overstayCount,
    zoneBreakdown,
    visitors: mapped
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: COMPLIANCE MANAGEMENT RULES & FORMULAS (BR-C01 .. BR-C12)
// ═══════════════════════════════════════════════════════════════════════════

export interface ObligationStatusResult {
  status: "upcoming" | "due" | "overdue" | "compliant" | "expiring_soon" | "expired";
  daysRemaining: number;
  isOverdue: boolean;
  isExpiringSoon: boolean;
  scoreCredit: number; // 0 to 1
}

/**
 * BR-C01 & BR-C02: Determine statutory status of an obligation / certificate
 * - Upcoming: due > reminder threshold (default 30 days)
 * - Due: within reminder threshold (<= 30 days) but not past due date
 * - Overdue: past due date and not completed
 * - Compliant: valid evidence active
 * - Expiring Soon: evidence valid but expires in <= 30 days
 * - Expired: evidence expiry date has passed
 */
export function evaluateObligationStatus(
  dueDateStr: string,
  expiryDateStr?: string | null,
  hasEvidence: boolean = false,
  isVerified: boolean = false,
  reminderDays: number = 30,
  currentDate: Date = new Date()
): ObligationStatusResult {
  const now = new Date(currentDate.toISOString().split("T")[0]).getTime();
  const due = new Date(dueDateStr).getTime();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  // If evidence is present and verified, check expiry date
  if (hasEvidence && isVerified && expiryDateStr) {
    const expiry = new Date(expiryDateStr).getTime();
    const expiryDiffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (expiryDiffDays < 0) {
      return {
        status: "expired",
        daysRemaining: expiryDiffDays,
        isOverdue: true,
        isExpiringSoon: false,
        scoreCredit: 0
      };
    }
    if (expiryDiffDays <= reminderDays) {
      return {
        status: "expiring_soon",
        daysRemaining: expiryDiffDays,
        isOverdue: false,
        isExpiringSoon: true,
        scoreCredit: 0.85 // 85% credit while in renewal cycle
      };
    }
    return {
      status: "compliant",
      daysRemaining: expiryDiffDays,
      isOverdue: false,
      isExpiringSoon: false,
      scoreCredit: 1.0
    };
  }

  // Without verified evidence: evaluate against due date
  if (diffDays < 0) {
    return {
      status: "overdue",
      daysRemaining: diffDays,
      isOverdue: true,
      isExpiringSoon: false,
      scoreCredit: 0
    };
  }
  if (diffDays === 0 || diffDays <= reminderDays) {
    return {
      status: "due",
      daysRemaining: diffDays,
      isOverdue: false,
      isExpiringSoon: false,
      scoreCredit: 0.50
    };
  }

  return {
    status: "upcoming",
    daysRemaining: diffDays,
    isOverdue: false,
    isExpiringSoon: false,
    scoreCredit: 1.0
  };
}

/**
 * BR-C03: Weighted Compliance Score Calculation
 * Weighted score = sum(weight * compliant status) / sum(weights)
 * If any CRITICAL obligation is overdue, triggers gating alert.
 */
export interface ComplianceScoreSummary {
  complianceScore: number;
  totalObligations: number;
  compliantCount: number;
  expiringSoonCount: number;
  dueCount: number;
  overdueCount: number;
  criticalOverdueCount: number;
  hasCriticalGatingAlert: boolean;
}

export function calculateComplianceScore(obligations: any[]): ComplianceScoreSummary {
  let totalWeight = 0;
  let earnedWeight = 0;
  let compliantCount = 0;
  let expiringSoonCount = 0;
  let dueCount = 0;
  let overdueCount = 0;
  let criticalOverdueCount = 0;

  obligations.forEach(o => {
    const weight = Number(o.weight) || (o.criticality === "CRITICAL" ? 25 : o.criticality === "HIGH" ? 15 : 10);
    totalWeight += weight;

    if (o.status === "compliant") {
      earnedWeight += weight * 1.0;
      compliantCount++;
    } else if (o.status === "expiring_soon") {
      earnedWeight += weight * 0.85;
      expiringSoonCount++;
    } else if (o.status === "due") {
      earnedWeight += weight * 0.50;
      dueCount++;
    } else if (o.status === "overdue" || o.status === "expired") {
      earnedWeight += 0;
      overdueCount++;
      if (o.criticality === "CRITICAL") {
        criticalOverdueCount++;
      }
    } else {
      // upcoming
      earnedWeight += weight * 1.0;
    }
  });

  const complianceScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;

  return {
    complianceScore,
    totalObligations: obligations.length,
    compliantCount,
    expiringSoonCount,
    dueCount,
    overdueCount,
    criticalOverdueCount,
    hasCriticalGatingAlert: criticalOverdueCount > 0
  };
}

/**
 * BR-C05: Advance Recurring Schedule
 * Computes next statutory due date based on frequency
 */
export function calculateNextDueDate(
  currentDueDate: string,
  frequency: "ANNUAL" | "BIENNIAL" | "QUARTERLY" | "HALF_YEARLY" | "MONTHLY" | "PERMANENT" | string
): string | null {
  if (frequency === "PERMANENT") return null;

  const d = new Date(currentDueDate);
  switch (frequency) {
    case "MONTHLY":
      d.setMonth(d.getMonth() + 1);
      break;
    case "QUARTERLY":
      d.setMonth(d.getMonth() + 3);
      break;
    case "HALF_YEARLY":
      d.setMonth(d.getMonth() + 6);
      break;
    case "ANNUAL":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "BIENNIAL":
      d.setFullYear(d.getFullYear() + 2);
      break;
    default:
      d.setFullYear(d.getFullYear() + 1);
  }
  return d.toISOString().split("T")[0];
}

/**
 * BR-C10: Inherent & Residual Risk Matrix
 * Inherent Score = Likelihood (1..5) × Impact (1..5)
 * Residual Score = Inherent Score - Mitigation Offset (recalculated)
 */
export function calculateRiskScores(
  likelihood: number,
  impact: number,
  mitigationEffectiveness: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM"
): { inherentScore: number; residualScore: number; riskRating: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" } {
  const l = Math.max(1, Math.min(5, likelihood || 3));
  const i = Math.max(1, Math.min(5, impact || 3));
  const inherentScore = l * i;

  let factor = 0.5; // Medium mitigation reduces risk by 50%
  if (mitigationEffectiveness === "HIGH") factor = 0.3; // 70% reduction
  if (mitigationEffectiveness === "LOW") factor = 0.8;  // 20% reduction

  const residualScore = Math.max(1, Math.round(inherentScore * factor));

  let riskRating: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (inherentScore >= 20) riskRating = "CRITICAL";
  else if (inherentScore >= 12) riskRating = "HIGH";
  else if (inherentScore >= 6) riskRating = "MEDIUM";

  return {
    inherentScore,
    residualScore,
    riskRating
  };
}

/**
 * BR-C11: Permit to Work (PTW) Prerequisites Check
 * Validates if the vendor/contractor has all required statutory certificates in active/valid state.
 */
export function validatePermitPrerequisites(
  vendorCertificates: Array<{ certificateName: string; status: string; expiryDate: string }>
): { allowed: boolean; blockingReasons: string[] } {
  const blockingReasons: string[] = [];

  vendorCertificates.forEach(cert => {
    if (cert.status === "expired") {
      blockingReasons.push(`Mandatory statutory prerequisite expired: ${cert.certificateName} (Expired on ${cert.expiryDate}).`);
    }
  });

  return {
    allowed: blockingReasons.length === 0,
    blockingReasons
  };
}

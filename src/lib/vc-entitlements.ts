/**
 * OfficeX Visitor Management & Statutory Compliance Package Entitlements
 * Defines pricing tiers, feature allowances, and commercial gating restrictions.
 */

export type VisitorTier = "none" | "starter" | "pro" | "cafm";
export type ComplianceTier = "none" | "essential" | "enterprise" | "cafm";

export interface VisitorEntitlements {
  tier: VisitorTier;
  tierName: string;
  monthlyPrice: number;
  maxVisitorsPerMonth: number; // -1 for unlimited
  maxTurnstiles: number;
  canAccessDashboard: boolean;
  canAccessReception: boolean;
  canAccessPreregister: boolean;
  canAccessInside: boolean;
  canUseTurnstileRelay: boolean;
  canAccessContractors: boolean;
  canAccessWatchlist: boolean;
  canAccessEmergencyMuster: boolean;
}

export interface ComplianceEntitlements {
  tier: ComplianceTier;
  tierName: string;
  monthlyPrice: number;
  maxLicenses: number;
  canAccessDashboard: boolean;
  canAccessRegister: boolean;
  canAccessCalendar: boolean;
  canAccessEvidence: boolean;
  canAccessCapa: boolean;
  canAccessPermits: boolean;
  canExportDueDiligencePack: boolean;
  hasMultiEntityEscalation: boolean;
}

export const VISITOR_TIERS: Record<VisitorTier, VisitorEntitlements> = {
  none: {
    tier: "none",
    tierName: "Unsubscribed",
    monthlyPrice: 0,
    maxVisitorsPerMonth: 0,
    maxTurnstiles: 0,
    canAccessDashboard: false,
    canAccessReception: false,
    canAccessPreregister: false,
    canAccessInside: false,
    canUseTurnstileRelay: false,
    canAccessContractors: false,
    canAccessWatchlist: false,
    canAccessEmergencyMuster: false,
  },
  starter: {
    tier: "starter",
    tierName: "Front-Desk Starter",
    monthlyPrice: 1499,
    maxVisitorsPerMonth: 250,
    maxTurnstiles: 1, // Reception desk tablet only
    canAccessDashboard: true,
    canAccessReception: true,
    canAccessPreregister: true,
    canAccessInside: true,
    canUseTurnstileRelay: false, // Locked on starter
    canAccessContractors: false, // Locked on starter
    canAccessWatchlist: false,   // Locked on starter
    canAccessEmergencyMuster: false, // Locked on starter
  },
  pro: {
    tier: "pro",
    tierName: "Speed-Gate Pro",
    monthlyPrice: 2999,
    maxVisitorsPerMonth: -1, // Unlimited
    maxTurnstiles: 6,
    canAccessDashboard: true,
    canAccessReception: true,
    canAccessPreregister: true,
    canAccessInside: true,
    canUseTurnstileRelay: true,
    canAccessContractors: true,
    canAccessWatchlist: true,
    canAccessEmergencyMuster: true,
  },
  cafm: {
    tier: "cafm",
    tierName: "CAFM Enterprise Suite",
    monthlyPrice: 19999,
    maxVisitorsPerMonth: -1,
    maxTurnstiles: 99,
    canAccessDashboard: true,
    canAccessReception: true,
    canAccessPreregister: true,
    canAccessInside: true,
    canUseTurnstileRelay: true,
    canAccessContractors: true,
    canAccessWatchlist: true,
    canAccessEmergencyMuster: true,
  },
};

export const COMPLIANCE_TIERS: Record<ComplianceTier, ComplianceEntitlements> = {
  none: {
    tier: "none",
    tierName: "Unsubscribed",
    monthlyPrice: 0,
    maxLicenses: 0,
    canAccessDashboard: false,
    canAccessRegister: false,
    canAccessCalendar: false,
    canAccessEvidence: false,
    canAccessCapa: false,
    canAccessPermits: false,
    canExportDueDiligencePack: false,
    hasMultiEntityEscalation: false,
  },
  essential: {
    tier: "essential",
    tierName: "Core Statutory Radar",
    monthlyPrice: 1999,
    maxLicenses: 15,
    canAccessDashboard: true,
    canAccessRegister: true,
    canAccessCalendar: true,
    canAccessEvidence: true,
    canAccessCapa: false, // Locked on essential
    canAccessPermits: false, // Locked on essential
    canExportDueDiligencePack: false, // Locked on essential
    hasMultiEntityEscalation: false,
  },
  enterprise: {
    tier: "enterprise",
    tierName: "Institutional Governance",
    monthlyPrice: 3499,
    maxLicenses: 48,
    canAccessDashboard: true,
    canAccessRegister: true,
    canAccessCalendar: true,
    canAccessEvidence: true,
    canAccessCapa: true,
    canAccessPermits: true,
    canExportDueDiligencePack: true,
    hasMultiEntityEscalation: true,
  },
  cafm: {
    tier: "cafm",
    tierName: "CAFM Enterprise Suite",
    monthlyPrice: 19999,
    maxLicenses: 48,
    canAccessDashboard: true,
    canAccessRegister: true,
    canAccessCalendar: true,
    canAccessEvidence: true,
    canAccessCapa: true,
    canAccessPermits: true,
    canExportDueDiligencePack: true,
    hasMultiEntityEscalation: true,
  },
};

/**
 * Determine Visitor Tier from plan string
 */
export function resolveVisitorTier(planName?: string | null): VisitorTier {
  if (!planName) return "starter"; // default fallback for active subscribers without specific plan
  const lower = planName.toLowerCase();
  if (lower.includes("cafm")) return "cafm";
  if (lower.includes("pro") || lower.includes("speed-gate") || lower.includes("gate")) return "pro";
  if (lower.includes("starter") || lower.includes("front-desk") || lower.includes("visitor")) return "starter";
  return "starter";
}

/**
 * Determine Compliance Tier from plan string
 */
export function resolveComplianceTier(planName?: string | null): ComplianceTier {
  if (!planName) return "essential"; // default fallback for active subscribers
  const lower = planName.toLowerCase();
  if (lower.includes("cafm")) return "cafm";
  if (lower.includes("enterprise") || lower.includes("institutional") || lower.includes("governance")) return "enterprise";
  if (lower.includes("essential") || lower.includes("radar") || lower.includes("core")) return "essential";
  return "essential";
}

export function getVisitorEntitlements(planName?: string | null): VisitorEntitlements {
  const tier = resolveVisitorTier(planName);
  return VISITOR_TIERS[tier];
}

export function getComplianceEntitlements(planName?: string | null): ComplianceEntitlements {
  const tier = resolveComplianceTier(planName);
  return COMPLIANCE_TIERS[tier];
}

import fs from "fs";
import path from "path";

export interface StatutoryCertificate {
  id: string;
  propertyId: string;
  name: string;
  category: "fire" | "lift" | "electrical" | "pcb" | "structural" | "insurance";
  categoryLabel: string;
  property: string;
  authority: string;
  regNumber: string;
  issueDate: string;
  expiry: string;
  expiryDateObj: string;
  inspectingOfficer: string;
  inspectionCycle: string;
  penaltyClause: string;
  documentUrl?: string;
  status: "Valid" | "Expiring Soon" | "Expired" | "In Renewal";
  leadTimeDays: number;
  estimatedRenewalCost: number;
  daysRemaining?: number;
}

export interface PPMAssetRecord {
  assetId: string;
  assetName: string;
  category: string;
  location: string;
  assignedVendor: string;
  technician: string;
  frequency: string;
  schedule: Record<string, "done" | "progress" | "sched" | "overdue">;
}

export interface ComplianceDatabase {
  property: {
    id: string;
    name: string;
    city: string;
    state: string;
    address: string;
    totalArea: number;
    grade: string;
  };
  certificates: StatutoryCertificate[];
  ppmSchedule: PPMAssetRecord[];
}

const DB_PATH = path.join(process.cwd(), "data", "compliance-db.json");

export function getComplianceDb(): ComplianceDatabase {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Compliance database not found at ${DB_PATH}`);
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

export function saveComplianceDb(data: ComplianceDatabase): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function parseDate(d: string | Date): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export function diffInDays(target: Date, reference: Date = new Date()): number {
  const diffTime = target.getTime() - reference.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Compute dynamic enriched certificate with calculated days remaining and live status
export function enrichCertificate(cert: StatutoryCertificate, referenceDate: Date = new Date("2026-09-16")): StatutoryCertificate {
  const exp = parseDate(cert.expiryDateObj || cert.expiry);
  const days = diffInDays(exp, referenceDate);

  let status: StatutoryCertificate["status"] = cert.status;
  if (cert.status !== "In Renewal") {
    if (days < 0) {
      status = "Expired";
    } else if (days <= 45) {
      status = "Expiring Soon";
    } else {
      status = "Valid";
    }
  }

  return {
    ...cert,
    daysRemaining: days,
    status
  };
}

// Compute Compliance Health Score (0-100%)
export function calculateComplianceHealth(certificates: StatutoryCertificate[]): {
  score: number;
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
  inRenewal: number;
} {
  const enriched = certificates.map(c => enrichCertificate(c));
  const total = enriched.length;
  if (total === 0) {
    return { score: 100, total: 0, valid: 0, expiringSoon: 0, expired: 0, inRenewal: 0 };
  }

  const valid = enriched.filter(c => c.status === "Valid").length;
  const expiringSoon = enriched.filter(c => c.status === "Expiring Soon").length;
  const expired = enriched.filter(c => c.status === "Expired").length;
  const inRenewal = enriched.filter(c => c.status === "In Renewal").length;

  // Formula: Valid = 100%, In Renewal = 85%, Expiring Soon = 50%, Expired = 0%
  const score = Math.max(0, Math.min(100, Math.round(((valid * 1.0 + inRenewal * 0.85 + expiringSoon * 0.5) / total) * 100)));

  return {
    score,
    total,
    valid,
    expiringSoon,
    expired,
    inRenewal
  };
}

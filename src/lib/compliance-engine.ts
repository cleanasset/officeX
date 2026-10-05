import fs from "fs";
import path from "path";
import os from "os";
import { persistDbToCloud, fetchDbFromCloud } from "./cloud-db-sync";

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

const DEFAULT_COMPLIANCE_DB: ComplianceDatabase = {
  property: {
    id: "",
    name: "Commercial Portfolio",
    city: "",
    state: "",
    address: "",
    totalArea: 0,
    grade: ""
  },
  certificates: [],
  ppmSchedule: []
};

const TMP_PATH = path.join(os.tmpdir(), "compliance-db.json");

function getStoragePath(): string {
  return TMP_PATH;
}

let inMemoryCache: ComplianceDatabase | null = null;

export function getComplianceDb(): ComplianceDatabase {
  if (inMemoryCache) {
    return inMemoryCache;
  }

  const p = getStoragePath();
  if (fs.existsSync(p)) {
    try {
      const raw = fs.readFileSync(p, "utf-8");
      inMemoryCache = JSON.parse(raw);
      return inMemoryCache!;
    } catch {
      // Fallback below
    }
  }

  inMemoryCache = JSON.parse(JSON.stringify(DEFAULT_COMPLIANCE_DB));
  return inMemoryCache!;
}

export function saveComplianceDb(data: ComplianceDatabase): void {
  inMemoryCache = data;
  const p = getStoragePath();
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch (fsErr) {
    console.warn("[COMPLIANCE] Local file write notice:", fsErr);
  }

  // Cloud PostgreSQL persistence
  persistDbToCloud(data, "compliance_db").catch((err) => {
    console.warn("[COMPLIANCE] Cloud persistence notice:", err);
  });
}

export function parseDate(d: string | Date): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export function diffInDays(target: Date, reference: Date = new Date()): number {
  const diffTime = target.getTime() - reference.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Compute dynamic enriched certificate with calculated days remaining and live status
export function enrichCertificate(cert: StatutoryCertificate, referenceDate: Date = new Date()): StatutoryCertificate {
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

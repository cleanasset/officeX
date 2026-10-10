import fs from 'fs';
import path from 'path';
import {
  evaluateCheckinEligibility,
  isVisitOverstay,
  computeEmergencyRollCall,
  evaluateObligationStatus,
  calculateComplianceScore,
  calculateNextDueDate,
  calculateRiskScores,
  validatePermitPrerequisites
} from './visitor-compliance-engine';

// ---------------------------------------------------------------------------
// TypeScript Interfaces for Visitor & Compliance SaaS Module
// ---------------------------------------------------------------------------

export interface VisitorEntity {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string | null;
  idType?: string;
  idNumber?: string;
  photoUrl?: string;
  isVip?: boolean;
  status: "active" | "blacklisted" | "flagged";
  createdAt: string;
}

export interface VisitEntity {
  id: string;
  propertyId: string;
  propertyName?: string;
  visitorId?: string;
  visitorName: string;
  company: string;
  mobile: string;
  email?: string | null;
  visitorType: "guest" | "client" | "vendor" | "contractor" | "interview_candidate" | "delivery" | "vip" | "auditor";
  hostId?: string;
  hostName: string;
  tenantId?: string;
  tenantName: string;
  purpose: string;
  visitStart: string;
  visitEnd: string;
  approvalStatus: "approved" | "pending" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  approvalRemarks?: string;
  status: "pre_registered" | "pending_approval" | "checked_in" | "checked_out" | "overstay" | "rejected" | "cancelled";
  zone: string;
  floor?: string;
  building?: string;
  passId: string;
  qrToken?: string;
  riskLevel: "low" | "medium" | "high";
  vehicle?: string | null;
  evacuationStatus: "SAFE" | "UNACCOUNTED" | "MISSING";
  checkinAt?: string | null;
  checkoutAt?: string | null;
  isOverstay?: boolean;
  notes?: string;
  createdAt: string;
}

export interface WatchlistEntity {
  id: string;
  name: string;
  identifier: string; // phone, email, or company name
  reason: string;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  activeFrom: string;
  status: "active" | "inactive";
  flaggedBy: string;
}

export interface ComplianceObligationEntity {
  id: string;
  propertyId: string;
  propertyName?: string;
  requirementKey: string;
  name: string;
  shortTitle: string;
  category: string;
  authority: string;
  frequency: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL" | "BIENNIAL" | "TRIENNIAL" | "PERMANENT";
  criticality: "CRITICAL" | "HIGH" | "MEDIUM";
  weight: number;
  description: string;
  status: "compliant" | "due" | "overdue" | "expiring_soon" | "upcoming";
  dueDate: string;
  effectiveDate?: string;
  certificateNumber?: string;
  ownerName: string;
  evidenceAttached: boolean;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  documentUrl?: string;
  documentFileName?: string;
  isPermanent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceEvidenceEntity {
  id: string;
  obligationId: string;
  requirementKey: string;
  documentTitle: string;
  certificateNumber: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  documentHash?: string;
  issuedDate: string;
  validUntilDate?: string;
  issuingAuthority: string;
  status: "submitted" | "verified" | "rejected";
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface IncidentEntity {
  id: string;
  propertyId: string;
  propertyName?: string;
  title: string;
  location: string;
  type: string;
  severity: "critical" | "high" | "moderate" | "low";
  occurredAt: string;
  reportedAt: string;
  reportedBy: string;
  status: "open" | "investigating" | "capa_assigned" | "closed";
  description: string;
  immediateAction: string;
  capaRequired: boolean;
  capaId?: string;
  escalationTriggered: boolean;
  escalatedTo?: string[];
  resolvedAt?: string;
  createdAt: string;
}

export interface CapaEntity {
  id: string;
  incidentId?: string;
  propertyId: string;
  action: string;
  actionType: "CORRECTIVE" | "PREVENTIVE";
  rootCause?: string;
  owner: string;
  dueDate: string;
  priority: "critical" | "high" | "medium" | "low";
  sourceType: "incident" | "audit" | "inspection" | "statutory_notice";
  sourceId?: string;
  status: "open" | "in_progress" | "pending_verification" | "closed";
  evidenceAttached: boolean;
  evidenceFileName?: string;
  evidenceUrl?: string;
  verificationApproved: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  closedAt?: string;
  createdAt: string;
}

export interface PermitEntity {
  id: string;
  propertyId: string;
  permitType: "HOT_WORK" | "HEIGHT_WORK" | "CONFINED_SPACE" | "ELECTRICAL_ISOLATION" | "HEAVY_LIFT";
  title: string;
  contractor: string;
  location: string;
  validFrom: string;
  validTo: string;
  riskControls: string[];
  status: "draft" | "pending_approval" | "active" | "closed" | "approval_blocked" | "revoked";
  approvedBy?: string;
  approvedAt?: string;
  safetyOfficer?: string;
  vendorPrerequisiteValid: boolean;
  vendorInsuranceExpiry?: string;
  createdAt: string;
}

export interface RiskEntity {
  id: string;
  propertyId: string;
  category: "Life Safety & Fire" | "Statutory & Municipal" | "Electrical & High Voltage" | "Environmental & ESG" | "Physical Security & Access" | "Operational";
  statement: string;
  likelihood: number; // 1-5
  impact: number;     // 1-5
  inherentScore: number; // likelihood * impact
  rating: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  mitigation: string;
  residualLikelihood: number; // 1-5
  residualImpact: number;     // 1-5
  residualScore: number;     // residualLikelihood * residualImpact
  owner: string;
  status: "active" | "mitigated" | "transferred" | "accepted";
  createdAt: string;
}

export interface VisitorComplianceDatabase {
  visitors: VisitorEntity[];
  visits: VisitEntity[];
  watchlist: WatchlistEntity[];
  obligations: ComplianceObligationEntity[];
  evidence: ComplianceEvidenceEntity[];
  incidents: IncidentEntity[];
  capas: CapaEntity[];
  permits: PermitEntity[];
  risks: RiskEntity[];
  config: {
    emergencyEvacuationActive: boolean;
    emergencyDeclaredAt: string | null;
    overstayGraceMinutes: number;
    earlyArrivalWindowMinutes: number;
    requireHostApprovalForGuests: boolean;
  };
}

// ---------------------------------------------------------------------------
// File-backed Persistence Layer
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'visitor-compliance-db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Pristine canonical database (Zero Mock Data)
export function getInitialVisitorComplianceDb(): VisitorComplianceDatabase {
  return {
    visitors: [],
    visits: [],
    watchlist: [],
    obligations: [],
    evidence: [],
    incidents: [],
    capas: [],
    permits: [],
    risks: [],
    config: {
      emergencyEvacuationActive: false,
      emergencyDeclaredAt: null,
      overstayGraceMinutes: 15,
      earlyArrivalWindowMinutes: 30,
      requireHostApprovalForGuests: false
    }
  };
}


// Read database
export function getVisitorComplianceDb(): VisitorComplianceDatabase {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialVisitorComplianceDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed: VisitorComplianceDatabase = JSON.parse(raw);
    
    // Auto-update real-time status: overstays
    const now = new Date();
    let hasChanges = false;
    
    if (parsed.visits && parsed.visits.length > 0) {
      parsed.visits.forEach(v => {
        if (v.status === "checked_in" && v.visitEnd) {
          const endTs = new Date(v.visitEnd).getTime();
          const graceMs = (parsed.config?.overstayGraceMinutes || 15) * 60 * 1000;
          if (now.getTime() > endTs + graceMs) {
            v.status = "overstay";
            v.isOverstay = true;
            hasChanges = true;
          }
        }
      });
    }

    // Auto-update compliance obligations status based on today's date
    if (parsed.obligations && parsed.obligations.length > 0) {
      parsed.obligations.forEach(o => {
        if (o.isPermanent || o.frequency === "PERMANENT") {
          o.status = "compliant";
          return;
        }
        const evalResult = evaluateObligationStatus(o.dueDate, null, o.evidenceAttached, o.verified);
        const updatedStatus = evalResult.status === "expired" ? "overdue" : evalResult.status;
        if (o.status !== updatedStatus) {
          o.status = updatedStatus;
          hasChanges = true;
        }
      });
    }

    if (hasChanges) {
      saveVisitorComplianceDb(parsed);
    }

    return parsed;
  } catch (err) {
    console.error("Error reading visitor-compliance-db.json, falling back to seed:", err);
    const initial = getInitialVisitorComplianceDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

// Write database
export function saveVisitorComplianceDb(db: VisitorComplianceDatabase): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Visitor Business Operations
// ---------------------------------------------------------------------------

export function getVisits(filters?: {
  propertyId?: string;
  status?: string;
  search?: string;
  visitorType?: string;
}) {
  const db = getVisitorComplianceDb();
  let list = db.visits || [];

  if (filters?.propertyId && filters.propertyId !== "ALL") {
    list = list.filter(v => !v.propertyId || v.propertyId === filters.propertyId);
  }

  if (filters?.status && filters.status !== "all") {
    list = list.filter(v => v.status === filters.status);
  }

  if (filters?.visitorType && filters.visitorType !== "all") {
    list = list.filter(v => v.visitorType === filters.visitorType);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(v =>
      v.visitorName.toLowerCase().includes(q) ||
      v.company.toLowerCase().includes(q) ||
      v.mobile.includes(q) ||
      v.hostName.toLowerCase().includes(q) ||
      v.passId.toLowerCase().includes(q)
    );
  }

  // Live KPI Summary (VC-01)
  const totalExpected = list.length;
  const insideOccupants = list.filter(v => v.status === "checked_in" || v.status === "overstay");
  const insideCount = insideOccupants.length;
  const checkedOutCount = list.filter(v => v.status === "checked_out").length;
  const overstayCount = list.filter(v => v.status === "overstay" || v.isOverstay).length;
  const pendingApprovalCount = list.filter(v => v.approvalStatus === "pending" || v.status === "pending_approval").length;
  const contractorCount = list.filter(v => v.visitorType === "contractor" || v.visitorType === "vendor").length;
  const emergencyRollCallCount = insideCount;

  return {
    summary: {
      totalExpected,
      insideCount,
      checkedOutCount,
      overstayCount,
      pendingApprovalCount,
      contractorCount,
      emergencyRollCallCount,
      emergencyActive: !!db.config.emergencyEvacuationActive
    },
    visits: list,
    watchlist: db.watchlist || []
  };
}

export function createVisit(params: {
  visitorName: string;
  company?: string;
  mobile: string;
  email?: string | null;
  visitorType?: VisitEntity['visitorType'];
  hostName?: string;
  tenantName?: string;
  purpose?: string;
  visitStart: string;
  visitEnd: string;
  accessZone?: string;
  floor?: string;
  building?: string;
  vehicleRegistration?: string;
  requiresApproval?: boolean;
  propertyId?: string;
  propertyName?: string;
}): { visit: VisitEntity; message: string; watchlistHit: boolean } {
  const db = getVisitorComplianceDb();

  // Watchlist Screening BR-V10
  const qMob = params.mobile.trim().toLowerCase();
  const qName = params.visitorName.trim().toLowerCase();
  const watchlistHit = (db.watchlist || []).some(
    w => w.status === "active" && (
      w.identifier.toLowerCase().includes(qMob) ||
      w.name.toLowerCase().includes(qName) ||
      (params.company && w.identifier.toLowerCase().includes(params.company.toLowerCase()))
    )
  );

  const visitId = `v-${Date.now()}`;
  const passToken = `PASS-QR-${Math.floor(100000 + Math.random() * 900000)}`;
  const needsApproval = params.requiresApproval || watchlistHit;

  const newVisit: VisitEntity = {
    id: visitId,
    propertyId: params.propertyId || "prop-001",
    propertyName: params.propertyName || "test building 1",
    visitorName: params.visitorName.trim(),
    company: params.company ? params.company.trim() : "Independent",
    mobile: params.mobile.trim(),
    email: params.email ? params.email.trim() : null,
    visitorType: params.visitorType || "guest",
    hostName: params.hostName || "Reception Desk",
    tenantName: params.tenantName || "Building General",
    purpose: params.purpose || "General Meeting",
    visitStart: new Date(params.visitStart).toISOString(),
    visitEnd: new Date(params.visitEnd).toISOString(),
    approvalStatus: needsApproval ? "pending" : "approved",
    status: needsApproval ? "pending_approval" : "pre_registered",
    zone: params.accessZone || "Main Reception",
    floor: params.floor || "G",
    building: params.building || "Main Tower",
    passId: passToken,
    qrToken: passToken,
    riskLevel: watchlistHit ? "high" : "low",
    vehicle: params.vehicleRegistration ? params.vehicleRegistration.trim().toUpperCase() : null,
    evacuationStatus: "UNACCOUNTED",
    createdAt: new Date().toISOString()
  };

  db.visits.unshift(newVisit);
  saveVisitorComplianceDb(db);

  let message = "Visit pre-registered. Digital pass activated.";
  if (watchlistHit) {
    message = "🚨 SECURITY ALERT: Visitor matches an active security watchlist entry. Routed to Security Manager for mandatory clearance.";
  } else if (needsApproval) {
    message = "Visit pre-registered and routed to host approval queue.";
  }

  return { visit: newVisit, message, watchlistHit };
}

export function checkinVisit(visitId: string): { success: boolean; visit: VisitEntity; message: string } {
  const db = getVisitorComplianceDb();
  const visit = db.visits.find(v => v.id === visitId || v.passId === visitId);
  if (!visit) {
    throw new Error(`Visit with ID or Pass ${visitId} not found.`);
  }

  // Watchlist block BR-V10
  const isBlocked = (db.watchlist || []).some(
    w => w.status === "active" && w.riskLevel === "CRITICAL" && (
      w.identifier.includes(visit.mobile) || w.name.toLowerCase() === visit.visitorName.toLowerCase()
    )
  );

  const eligibility = evaluateCheckinEligibility({
    visitStart: visit.visitStart,
    visitEnd: visit.visitEnd,
    approvalStatus: visit.approvalStatus,
    isBlacklisted: isBlocked,
    status: visit.status,
    earlyArrivalGraceMinutes: db.config.earlyArrivalWindowMinutes || 30
  });

  if (!eligibility.eligible) {
    throw new Error(eligibility.reason || "Check-in eligibility criteria not met.");
  }

  visit.status = "checked_in";
  visit.checkinAt = new Date().toISOString();
  visit.evacuationStatus = "SAFE";

  saveVisitorComplianceDb(db);
  return {
    success: true,
    visit,
    message: `Visitor ${visit.visitorName} successfully checked in. Speed gate access authorized.`
  };
}

export function checkoutVisit(visitId: string): { success: boolean; visit: VisitEntity; message: string } {
  const db = getVisitorComplianceDb();
  const visit = db.visits.find(v => v.id === visitId || v.passId === visitId);
  if (!visit) {
    throw new Error(`Visit with ID or Pass ${visitId} not found.`);
  }

  visit.status = "checked_out";
  visit.checkoutAt = new Date().toISOString();
  visit.isOverstay = false;
  visit.evacuationStatus = "SAFE";

  saveVisitorComplianceDb(db);
  return {
    success: true,
    visit,
    message: `Visitor ${visit.visitorName} checked out. Badge & QR token deactivated.`
  };
}

export function approveVisit(visitId: string, decision: "approved" | "rejected", approver: string = "Host", remarks?: string): VisitEntity {
  const db = getVisitorComplianceDb();
  const visit = db.visits.find(v => v.id === visitId);
  if (!visit) {
    throw new Error(`Visit ${visitId} not found.`);
  }

  visit.approvalStatus = decision;
  visit.approvedBy = approver;
  visit.approvedAt = new Date().toISOString();
  visit.approvalRemarks = remarks;
  visit.status = decision === "approved" ? "pre_registered" : "rejected";

  saveVisitorComplianceDb(db);
  return visit;
}

export function updateEmergencyEvacuationStatus(active: boolean, markedSafeVisits?: string[]): {
  active: boolean;
  rollCall: ReturnType<typeof computeEmergencyRollCall>;
} {
  const db = getVisitorComplianceDb();
  db.config.emergencyEvacuationActive = active;
  db.config.emergencyDeclaredAt = active ? new Date().toISOString() : null;

  if (markedSafeVisits && markedSafeVisits.length > 0) {
    db.visits.forEach(v => {
      if (markedSafeVisits.includes(v.id)) {
        v.evacuationStatus = "SAFE";
      }
    });
  }

  saveVisitorComplianceDb(db);

  // Compute roll call
  const activeVisits = db.visits.filter(v => v.status === "checked_in" || v.status === "overstay");
  const rollCall = computeEmergencyRollCall(
    activeVisits.map(v => ({
      id: v.id,
      visitorName: v.visitorName,
      company: v.company,
      hostName: v.hostName,
      tenantName: v.tenantName,
      building: v.building || "Tower A",
      floor: v.floor || "G",
      zone: v.zone,
      checkinAt: v.checkinAt || v.visitStart,
      status: v.evacuationStatus || "UNACCOUNTED"
    }))
  );

  return { active, rollCall };
}

// ---------------------------------------------------------------------------
// Compliance Business Operations
// ---------------------------------------------------------------------------

export function getComplianceScorecardAndObligations(filters?: {
  propertyId?: string;
  category?: string;
}) {
  const db = getVisitorComplianceDb();
  let list = db.obligations || [];

  if (filters?.propertyId && filters.propertyId !== "ALL" && filters.propertyId !== "Commercial Asset") {
    const pId = filters.propertyId.toLowerCase().trim();
    list = list.filter(o => 
      !o.propertyId || 
      o.propertyId.toLowerCase() === pId ||
      (o.propertyName && (o.propertyName.toLowerCase().includes(pId) || pId.includes(o.propertyName.toLowerCase())))
    );
  }

  if (filters?.category && filters.category !== "all") {
    list = list.filter(o => o.category.toLowerCase().includes(filters.category!.toLowerCase()));
  }

  const scorecard = calculateComplianceScore(list);

  return {
    scorecard,
    obligations: list,
    evidence: db.evidence || [],
    incidents: db.incidents || [],
    capas: db.capas || [],
    permits: db.permits || [],
    risks: db.risks || []
  };
}

export function createObligation(params: {
  name: string;
  category: string;
  authority: string;
  frequency?: ComplianceObligationEntity['frequency'];
  criticality?: ComplianceObligationEntity['criticality'];
  dueDate: string;
  ownerName?: string;
  description?: string;
  propertyId?: string;
  propertyName?: string;
}): ComplianceObligationEntity {
  const db = getVisitorComplianceDb();

  const weight = params.criticality === "CRITICAL" ? 25 : params.criticality === "HIGH" ? 15 : 10;
  const newObligation: ComplianceObligationEntity = {
    id: `OBL-${Date.now()}`,
    propertyId: params.propertyId || "prop-001",
    propertyName: params.propertyName || "test building 1",
    requirementKey: params.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: params.name.trim(),
    shortTitle: params.name.split('(')[0].trim(),
    category: params.category,
    authority: params.authority,
    frequency: params.frequency || "ANNUAL",
    criticality: params.criticality || "HIGH",
    weight,
    description: params.description || `Statutory obligation for ${params.name}`,
    status: "upcoming",
    dueDate: params.dueDate,
    ownerName: params.ownerName || "Compliance Manager",
    evidenceAttached: false,
    verified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.obligations.unshift(newObligation);
  saveVisitorComplianceDb(db);
  return newObligation;
}

export function uploadAndVerifyEvidence(params: {
  obligationId: string;
  certificateNumber: string;
  issuedDate: string;
  validUntilDate?: string;
  fileName: string;
  fileUrl?: string;
  uploadedBy?: string;
  autoVerify?: boolean;
}): { evidence: ComplianceEvidenceEntity; obligation: ComplianceObligationEntity } {
  const db = getVisitorComplianceDb();
  const obligation = db.obligations.find(o => o.id === params.obligationId || o.requirementKey === params.obligationId);
  if (!obligation) {
    throw new Error(`Obligation ${params.obligationId} not found.`);
  }

  const evId = `EVD-${Date.now()}`;
  const isVerified = params.autoVerify !== false;

  const newEvidence: ComplianceEvidenceEntity = {
    id: evId,
    obligationId: obligation.id,
    requirementKey: obligation.requirementKey,
    documentTitle: `${obligation.shortTitle} Clearance (${params.certificateNumber})`,
    certificateNumber: params.certificateNumber,
    fileName: params.fileName,
    fileUrl: params.fileUrl || `/docs/compliance/${params.fileName}`,
    fileSizeBytes: 1024 * 1024 * 2, // ~2MB
    documentHash: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    issuedDate: params.issuedDate,
    validUntilDate: params.validUntilDate,
    issuingAuthority: obligation.authority,
    status: isVerified ? "verified" : "submitted",
    verifiedBy: isVerified ? (params.uploadedBy || "Compliance Director") : undefined,
    verifiedAt: isVerified ? new Date().toISOString() : undefined,
    uploadedBy: params.uploadedBy || "EHS Manager",
    createdAt: new Date().toISOString()
  };

  db.evidence.unshift(newEvidence);

  // Update obligation
  obligation.evidenceAttached = true;
  obligation.certificateNumber = params.certificateNumber;
  obligation.documentFileName = params.fileName;
  obligation.documentUrl = newEvidence.fileUrl;

  if (isVerified) {
    obligation.verified = true;
    obligation.verifiedBy = params.uploadedBy || "Compliance Director";
    obligation.verifiedAt = new Date().toISOString();
    obligation.status = "compliant";

    if (params.validUntilDate) {
      obligation.dueDate = params.validUntilDate;
    } else if (obligation.frequency !== "PERMANENT") {
      const nextDate = calculateNextDueDate(params.issuedDate, obligation.frequency);
      if (nextDate) obligation.dueDate = nextDate;
    }
  }

  obligation.updatedAt = new Date().toISOString();
  saveVisitorComplianceDb(db);

  return { evidence: newEvidence, obligation };
}

export function logIncident(params: {
  title: string;
  location: string;
  type?: string;
  severity?: IncidentEntity['severity'];
  description?: string;
  immediateAction: string;
  reportedBy?: string;
  propertyId?: string;
}): { incident: IncidentEntity; capa?: CapaEntity; isCritical: boolean } {
  const db = getVisitorComplianceDb();
  const incId = `INC-${Date.now()}`;
  const isCritical = params.severity === "critical";
  const capaId = `CAPA-${Date.now()}`;

  const newIncident: IncidentEntity = {
    id: incId,
    propertyId: params.propertyId || "prop-001",
    propertyName: "test building 1",
    title: params.title.trim(),
    location: params.location.trim(),
    type: params.type || "Safety Hazard",
    severity: params.severity || "moderate",
    occurredAt: new Date().toISOString(),
    reportedAt: new Date().toISOString(),
    reportedBy: params.reportedBy || "Operations Staff",
    status: "capa_assigned",
    description: params.description || params.title,
    immediateAction: params.immediateAction.trim(),
    capaRequired: true,
    capaId,
    escalationTriggered: isCritical,
    escalatedTo: isCritical ? ["Head of EHS", "Property Director", "Municipal Liaison"] : [],
    createdAt: new Date().toISOString()
  };

  db.incidents.unshift(newIncident);

  const newCapa: CapaEntity = {
    id: capaId,
    incidentId: incId,
    propertyId: params.propertyId || "prop-001",
    action: `Remediate root cause for: ${params.title}`,
    actionType: "CORRECTIVE",
    owner: "Facility Supervisor",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: isCritical ? "critical" : "high",
    sourceType: "incident",
    sourceId: incId,
    status: "open",
    evidenceAttached: false,
    verificationApproved: false,
    createdAt: new Date().toISOString()
  };

  db.capas.unshift(newCapa);
  saveVisitorComplianceDb(db);

  return { incident: newIncident, capa: newCapa, isCritical };
}

export function closeCapa(params: {
  capaId: string;
  evidenceFileName: string;
  verifiedBy: string;
}): CapaEntity {
  const db = getVisitorComplianceDb();
  const capa = db.capas.find(c => c.id === params.capaId);
  if (!capa) {
    throw new Error(`CAPA ${params.capaId} not found.`);
  }

  // Strict BR-C08 enforcement
  if (!params.evidenceFileName) {
    throw new Error("BR-C08 Violation: CAPA cannot be closed without verification evidence.");
  }

  capa.evidenceAttached = true;
  capa.evidenceFileName = params.evidenceFileName;
  capa.evidenceUrl = `/docs/compliance/${params.evidenceFileName}`;
  capa.verificationApproved = true;
  capa.verifiedBy = params.verifiedBy;
  capa.verifiedAt = new Date().toISOString();
  capa.status = "closed";
  capa.closedAt = new Date().toISOString();

  // If linked to incident, update incident status if all CAPAs closed
  if (capa.incidentId) {
    const inc = db.incidents.find(i => i.id === capa.incidentId);
    if (inc) {
      inc.status = "closed";
      inc.resolvedAt = new Date().toISOString();
    }
  }

  saveVisitorComplianceDb(db);
  return capa;
}

export function createOrApprovePermit(params: {
  permitType?: PermitEntity['permitType'];
  title?: string;
  contractor?: string;
  location?: string;
  validFrom?: string;
  validTo?: string;
  riskControls?: string[];
  isApprovalAction?: boolean;
  permitId?: string;
  vendorPrerequisiteValid?: boolean;
  approver?: string;
}): { permit: PermitEntity; message: string } {
  const db = getVisitorComplianceDb();

  if (params.isApprovalAction && params.permitId) {
    const permit = db.permits.find(p => p.id === params.permitId);
    if (!permit) {
      throw new Error(`Permit ${params.permitId} not found.`);
    }

    // Validate contractor compliance BR-C11
    const certs = (permit.vendorPrerequisiteValid && params.vendorPrerequisiteValid !== false)
      ? [{ certificateName: "Contractor EHS & Insurance", status: "valid", expiryDate: permit.vendorInsuranceExpiry || "2027-12-31" }]
      : [{ certificateName: "Contractor EHS & Insurance", status: "expired", expiryDate: permit.vendorInsuranceExpiry || "2026-08-31" }];
    const validation = validatePermitPrerequisites(certs);

    if (!validation.allowed) {
      permit.status = "approval_blocked";
      saveVisitorComplianceDb(db);
      throw new Error(validation.blockingReasons.join("; ") || "BR-C11 Violation: Contractor statutory prerequisites expired.");
    }

    permit.status = "active";
    permit.approvedBy = params.approver || "Chief Safety Officer";
    permit.approvedAt = new Date().toISOString();
    saveVisitorComplianceDb(db);

    return {
      permit,
      message: "Permit approved and activated. Safety controls verified."
    };
  }

  // Create new permit
  const newPermit: PermitEntity = {
    id: `PTW-${Date.now()}`,
    propertyId: "prop-001",
    permitType: params.permitType || "HOT_WORK",
    title: params.title?.trim() || "Hot Work Permit",
    contractor: params.contractor?.trim() || "Building MEP Contractor",
    location: params.location?.trim() || "Main Facility",
    validFrom: params.validFrom || new Date().toISOString(),
    validTo: params.validTo || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    riskControls: params.riskControls || ["Fire extinguisher deployed", "Trained supervisor present"],
    status: "pending_approval",
    vendorPrerequisiteValid: params.vendorPrerequisiteValid !== false,
    createdAt: new Date().toISOString()
  };

  db.permits.unshift(newPermit);
  saveVisitorComplianceDb(db);

  return {
    permit: newPermit,
    message: "Permit submitted for safety officer review and clearance."
  };
}

export function createRisk(params: {
  category: RiskEntity['category'];
  statement: string;
  likelihood: number;
  impact: number;
  mitigation: string;
  residualLikelihood?: number;
  residualImpact?: number;
  owner?: string;
}): RiskEntity {
  const db = getVisitorComplianceDb();
  const scores = calculateRiskScores(
    params.likelihood,
    params.impact,
    "MEDIUM"
  );

  const newRisk: RiskEntity = {
    id: `RSK-${Date.now()}`,
    propertyId: "prop-001",
    category: params.category,
    statement: params.statement.trim(),
    likelihood: params.likelihood,
    impact: params.impact,
    inherentScore: scores.inherentScore,
    rating: scores.riskRating,
    mitigation: params.mitigation.trim(),
    residualLikelihood: params.residualLikelihood || 1,
    residualImpact: params.residualImpact || 2,
    residualScore: scores.residualScore,
    owner: params.owner || "Compliance Officer",
    status: "active",
    createdAt: new Date().toISOString()
  };

  db.risks.unshift(newRisk);
  saveVisitorComplianceDb(db);
  return newRisk;
}

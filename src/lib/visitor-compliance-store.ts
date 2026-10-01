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

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'visitor-compliance-db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Seed pristine canonical database
export function getInitialVisitorComplianceDb(): VisitorComplianceDatabase {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return {
    visitors: [
      {
        id: "VIS-001",
        name: "Vikram Malhotra",
        company: "McKinsey & Company",
        phone: "+91 98200 44211",
        email: "v.malhotra@mckinsey.com",
        status: "active",
        isVip: false,
        createdAt: "2026-08-15T10:00:00.000Z"
      },
      {
        id: "VIS-002",
        name: "Ananya Deshmukh",
        company: "Deloitte India",
        phone: "+91 97690 12890",
        email: "ananya.d@deloitte.com",
        status: "active",
        isVip: false,
        createdAt: "2026-09-01T11:00:00.000Z"
      },
      {
        id: "VIS-003",
        name: "Ramesh Pawar",
        company: "Voltas MEP Services",
        phone: "+91 99300 88712",
        status: "active",
        isVip: false,
        createdAt: "2026-09-10T09:00:00.000Z"
      },
      {
        id: "VIS-004",
        name: "Suresh Kumar",
        company: "BlueDart Express",
        phone: "+91 98199 66543",
        status: "active",
        isVip: false,
        createdAt: "2026-09-12T08:30:00.000Z"
      },
      {
        id: "VIS-005",
        name: "Aditya Singhania",
        company: "Singhania Holdings",
        phone: "+91 98210 99999",
        email: "aditya@singhaniaholdings.com",
        status: "active",
        isVip: true,
        createdAt: "2026-09-15T14:00:00.000Z"
      }
    ],

    visits: [
      {
        id: "v-1001",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        visitorId: "VIS-001",
        visitorName: "Vikram Malhotra",
        company: "McKinsey & Company",
        mobile: "+91 98200 44211",
        email: "v.malhotra@mckinsey.com",
        visitorType: "client",
        hostName: "Ravi Mehta",
        tenantName: "Godrej Capital",
        purpose: "Q3 Asset Advisory & Portfolio Strategy",
        visitStart: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        visitEnd: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        approvalStatus: "approved",
        checkinAt: new Date(now.getTime() - 110 * 60 * 1000).toISOString(),
        checkoutAt: null,
        status: "checked_in",
        zone: "Floor 14 - Executive Suite",
        floor: "14",
        building: "Tower A",
        passId: "PASS-QR-88910",
        qrToken: "PASS-QR-88910",
        riskLevel: "low",
        vehicle: "MH-02-CB-9081",
        evacuationStatus: "SAFE",
        createdAt: new Date(now.getTime() - 180 * 60 * 1000).toISOString()
      },
      {
        id: "v-1002",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        visitorId: "VIS-002",
        visitorName: "Ananya Deshmukh",
        company: "Deloitte India",
        mobile: "+91 97690 12890",
        email: "ananya.d@deloitte.com",
        visitorType: "interview_candidate",
        hostName: "Priya Sharma",
        tenantName: "Apex Ventures",
        purpose: "Senior Financial Analyst Round 2",
        visitStart: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        visitEnd: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        approvalStatus: "approved",
        checkinAt: null,
        checkoutAt: null,
        status: "pre_registered",
        zone: "Floor 6 - Boardroom B",
        floor: "6",
        building: "Tower A",
        passId: "PASS-QR-88911",
        qrToken: "PASS-QR-88911",
        riskLevel: "low",
        vehicle: null,
        evacuationStatus: "UNACCOUNTED",
        createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      },
      {
        id: "v-1003",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        visitorId: "VIS-003",
        visitorName: "Ramesh Pawar",
        company: "Voltas MEP Services",
        mobile: "+91 99300 88712",
        visitorType: "contractor",
        hostName: "Kailash Verma (FM)",
        tenantName: "Building Management",
        purpose: "AHU Filter Replacement & Pressure Test",
        visitStart: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        visitEnd: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // Ended 45m ago -> Overstay
        approvalStatus: "approved",
        checkinAt: new Date(now.getTime() - 230 * 60 * 1000).toISOString(),
        checkoutAt: null,
        status: "overstay",
        zone: "Basement 1 - Chiller Plant",
        floor: "B1",
        building: "Tower A",
        passId: "PASS-QR-88912",
        qrToken: "PASS-QR-88912",
        riskLevel: "medium",
        isOverstay: true,
        vehicle: null,
        evacuationStatus: "UNACCOUNTED",
        createdAt: new Date(now.getTime() - 300 * 60 * 1000).toISOString()
      },
      {
        id: "v-1004",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        visitorId: "VIS-004",
        visitorName: "Suresh Kumar",
        company: "BlueDart Express",
        mobile: "+91 98199 66543",
        visitorType: "delivery",
        hostName: "Mailroom Desk",
        tenantName: "Tata Consultancy Services",
        purpose: "Legal Contracts Delivery (Ref: BD-4491)",
        visitStart: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        visitEnd: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        approvalStatus: "approved",
        checkinAt: new Date(now.getTime() - 85 * 60 * 1000).toISOString(),
        checkoutAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
        status: "checked_out",
        zone: "Ground Floor Mailroom",
        floor: "G",
        building: "Tower A",
        passId: "PASS-QR-88913",
        qrToken: "PASS-QR-88913",
        riskLevel: "low",
        vehicle: "MH-01-BK-2201",
        evacuationStatus: "SAFE",
        createdAt: new Date(now.getTime() - 120 * 60 * 1000).toISOString()
      },
      {
        id: "v-1005",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        visitorId: "VIS-005",
        visitorName: "Aditya Singhania",
        company: "Singhania Holdings",
        mobile: "+91 98210 99999",
        email: "aditya@singhaniaholdings.com",
        visitorType: "vip",
        hostName: "Chairman Office",
        tenantName: "Prestige Group",
        purpose: "Board Advisory Briefing",
        visitStart: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        visitEnd: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        approvalStatus: "pending",
        checkinAt: null,
        checkoutAt: null,
        status: "pending_approval",
        zone: "Penthouse Level",
        floor: "22",
        building: "Tower A",
        passId: "PASS-QR-88914",
        qrToken: "PASS-QR-88914",
        riskLevel: "low",
        vehicle: "MH-01-DD-0001",
        evacuationStatus: "UNACCOUNTED",
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      }
    ],

    watchlist: [
      {
        id: "WL-01",
        name: "Kunal Singhal",
        identifier: "+91 98200 00099",
        reason: "Unauthorized commercial photography attempt; barred from premises.",
        riskLevel: "HIGH",
        activeFrom: "2026-06-01",
        status: "active",
        flaggedBy: "Head of Physical Security"
      },
      {
        id: "WL-02",
        name: "Apex Facade Agency (Blacklisted sub-vendor)",
        identifier: "Apex Facade",
        reason: "Repeated safety violations on height work without harness.",
        riskLevel: "CRITICAL",
        activeFrom: "2026-08-10",
        status: "active",
        flaggedBy: "Chief Safety Officer"
      }
    ],

    obligations: [
      {
        id: "OBL-001",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        requirementKey: "fire_noc",
        name: "Fire Safety Certificate & NOC (Form-B Inspection)",
        shortTitle: "Fire Safety NOC",
        category: "Fire & Life Safety",
        authority: "Directorate of Fire & Emergency Services",
        frequency: "ANNUAL",
        criticality: "CRITICAL",
        weight: 25,
        description: "Annual municipal fire prevention, hydrants, sprinklers & life safety inspection clearance.",
        status: "compliant",
        dueDate: "2027-04-30",
        effectiveDate: "2026-05-01",
        certificateNumber: "MH-FIRE-NOC-2026-9812",
        ownerName: "Chief EHS Officer",
        evidenceAttached: true,
        verified: true,
        verifiedAt: "2026-05-04T10:00:00.000Z",
        verifiedBy: "Compliance Director",
        documentUrl: "/docs/compliance/MH-FIRE-NOC-2026.pdf",
        documentFileName: "MH-FIRE-NOC-2026.pdf",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-05-04T10:00:00.000Z"
      },
      {
        id: "OBL-002",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        requirementKey: "lift_license",
        name: "Elevator & Escalator Safety License (Form-A)",
        shortTitle: "Lift Safety License",
        category: "Lift & Escalator",
        authority: "Chief Electrical Inspectorate / PWD Lift Division",
        frequency: "ANNUAL",
        criticality: "CRITICAL",
        weight: 20,
        description: "Annual statutory lift operation license, rope test & emergency brake safety certificate.",
        status: "expiring_soon", // within 30 days
        dueDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        effectiveDate: "2025-10-20",
        certificateNumber: "PWD-LIFT-LIC-44091",
        ownerName: "FM Technical Lead",
        evidenceAttached: true,
        verified: true,
        verifiedAt: "2025-10-22T14:30:00.000Z",
        verifiedBy: "Senior Facility Manager",
        documentUrl: "/docs/compliance/PWD-LIFT-LIC-44091.pdf",
        documentFileName: "PWD-LIFT-LIC-44091.pdf",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z"
      },
      {
        id: "OBL-003",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        requirementKey: "spcb_cto",
        name: "Pollution Control Board Consent to Operate (CTO)",
        shortTitle: "SPCB Consent (CTO)",
        category: "Environmental",
        authority: "State Pollution Control Board (MPCB / CPCB)",
        frequency: "BIENNIAL",
        criticality: "HIGH",
        weight: 15,
        description: "Air & Water Pollution Prevention Acts consent for building emissions & effluent discharge.",
        status: "compliant",
        dueDate: "2027-12-31",
        effectiveDate: "2025-12-01",
        certificateNumber: "MPCB-CTO-RED-2025-0819",
        ownerName: "Sustainability Lead",
        evidenceAttached: true,
        verified: true,
        verifiedAt: "2025-12-05T09:15:00.000Z",
        verifiedBy: "Compliance Director",
        documentUrl: "/docs/compliance/MPCB-CTO-2025.pdf",
        documentFileName: "MPCB-CTO-2025.pdf",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2025-12-05T09:15:00.000Z"
      },
      {
        id: "OBL-004",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        requirementKey: "occupancy_cert",
        name: "Commercial Occupancy Certificate (OC) / BU Permission",
        shortTitle: "Occupancy Certificate (OC)",
        category: "Municipal & Structural",
        authority: "Municipal Urban Development Authority",
        frequency: "PERMANENT",
        criticality: "CRITICAL",
        weight: 15,
        description: "Permanent building authorization certifying construction per approved sanction plans.",
        status: "compliant",
        dueDate: "2099-12-31",
        effectiveDate: "2022-03-15",
        certificateNumber: "MCGM-OC-COMM-2022-771",
        ownerName: "General Counsel",
        evidenceAttached: true,
        verified: true,
        isPermanent: true,
        verifiedAt: "2022-03-20T11:00:00.000Z",
        verifiedBy: "Legal Head",
        documentUrl: "/docs/compliance/MCGM-OC-COMM-2022-771.pdf",
        documentFileName: "MCGM-OC-COMM-2022-771.pdf",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      },
      {
        id: "OBL-005",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        requirementKey: "dg_cpcb",
        name: "Diesel Generator CPCB-IV Emission & Noise Test",
        shortTitle: "DG Emission & Noise Test",
        category: "Electrical & Power",
        authority: "Central Pollution Control Board (CPCB)",
        frequency: "QUARTERLY",
        criticality: "HIGH",
        weight: 10,
        description: "Acoustic enclosure noise dbA check and stack emission particulate monitoring report.",
        status: "compliant",
        dueDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        effectiveDate: "2026-08-15",
        certificateNumber: "DG-CPCB-Q3-2026-224",
        ownerName: "MEP Electrical Engineer",
        evidenceAttached: true,
        verified: true,
        verifiedAt: "2026-08-18T16:00:00.000Z",
        verifiedBy: "FM Technical Lead",
        documentUrl: "/docs/compliance/DG-CPCB-Q3-2026.pdf",
        documentFileName: "DG-CPCB-Q3-2026.pdf",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-08-18T16:00:00.000Z"
      },
      {
        id: "OBL-006",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        requirementKey: "electrical_substation",
        name: "Electrical Substation & Transformer Safety NOC (CEIG)",
        shortTitle: "Electrical Substation NOC",
        category: "Electrical & Power",
        authority: "Central / State Electrical Inspectorate to Govt (CEIG)",
        frequency: "ANNUAL",
        criticality: "HIGH",
        weight: 15,
        description: "33kV / 11kV substation earthing pit resistance test & transformer oil breakdown voltage clearance.",
        status: "compliant",
        dueDate: "2027-02-28",
        effectiveDate: "2026-03-01",
        certificateNumber: "CEIG-MH-SUB-2026-4011",
        ownerName: "Chief Electrical Engineer",
        evidenceAttached: true,
        verified: true,
        verifiedAt: "2026-03-05T12:00:00.000Z",
        verifiedBy: "Compliance Director",
        documentUrl: "/docs/compliance/CEIG-MH-SUB-2026.pdf",
        documentFileName: "CEIG-MH-SUB-2026.pdf",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-03-05T12:00:00.000Z"
      },
      {
        id: "OBL-007",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        requirementKey: "facade_audit",
        name: "Facade & Structural Stability Audit Certificate",
        shortTitle: "Facade & Structural Audit",
        category: "Municipal & Structural",
        authority: "Empanelled Structural Engineer / Municipal Authority",
        frequency: "TRIENNIAL",
        criticality: "HIGH",
        weight: 10,
        description: "Comprehensive glazing bracket anchor test, thermal imaging & structural load deflection inspection.",
        status: "compliant",
        dueDate: "2028-06-30",
        effectiveDate: "2025-07-01",
        certificateNumber: "STRUCT-FACADE-2025-309",
        ownerName: "Structural Auditor",
        evidenceAttached: true,
        verified: true,
        verifiedAt: "2025-07-08T15:00:00.000Z",
        verifiedBy: "Compliance Director",
        documentUrl: "/docs/compliance/STRUCT-FACADE-2025.pdf",
        documentFileName: "STRUCT-FACADE-2025.pdf",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2025-07-08T15:00:00.000Z"
      },
      {
        id: "OBL-008",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        requirementKey: "stp_water",
        name: "Sewage Treatment Plant (STP) Treated Water Quality Test",
        shortTitle: "STP Water Quality Report",
        category: "Environmental",
        authority: "NABL Accredited Environmental Testing Lab",
        frequency: "MONTHLY",
        criticality: "MEDIUM",
        weight: 10,
        description: "BOD, COD, pH & Total Suspended Solids (TSS) testing for flushing & HVAC cooling tower reuse.",
        status: "compliant",
        dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        effectiveDate: "2026-09-10",
        certificateNumber: "NABL-LAB-STP-2026-091",
        ownerName: "EHS Officer",
        evidenceAttached: true,
        verified: true,
        verifiedAt: "2026-09-12T10:00:00.000Z",
        verifiedBy: "FM Technical Lead",
        documentUrl: "/docs/compliance/NABL-LAB-STP-2026-091.pdf",
        documentFileName: "NABL-LAB-STP-2026-091.pdf",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-09-12T10:00:00.000Z"
      }
    ],

    evidence: [
      {
        id: "EVD-001",
        obligationId: "OBL-001",
        requirementKey: "fire_noc",
        documentTitle: "Annual Fire NOC Form-B Clearance 2026-27",
        certificateNumber: "MH-FIRE-NOC-2026-9812",
        fileName: "MH-FIRE-NOC-2026.pdf",
        fileUrl: "/docs/compliance/MH-FIRE-NOC-2026.pdf",
        fileSizeBytes: 2450000,
        documentHash: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        issuedDate: "2026-05-01",
        validUntilDate: "2027-04-30",
        issuingAuthority: "Directorate of Fire & Emergency Services",
        status: "verified",
        verifiedBy: "Compliance Director",
        verifiedAt: "2026-05-04T10:00:00.000Z",
        uploadedBy: "Chief EHS Officer",
        createdAt: "2026-05-03T14:00:00.000Z"
      },
      {
        id: "EVD-002",
        obligationId: "OBL-004",
        requirementKey: "occupancy_cert",
        documentTitle: "Municipal Sanctioned Full Occupancy Certificate",
        certificateNumber: "MCGM-OC-COMM-2022-771",
        fileName: "MCGM-OC-COMM-2022-771.pdf",
        fileUrl: "/docs/compliance/MCGM-OC-COMM-2022-771.pdf",
        fileSizeBytes: 5120000,
        documentHash: "SHA256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        issuedDate: "2022-03-15",
        issuingAuthority: "Municipal Urban Development Authority",
        status: "verified",
        verifiedBy: "Legal Head",
        verifiedAt: "2022-03-20T11:00:00.000Z",
        uploadedBy: "General Counsel",
        createdAt: "2022-03-19T09:00:00.000Z"
      }
    ],

    incidents: [
      {
        id: "INC-2026-101",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        title: "Minor hydraulic fluid seep in Basement 2 Passenger Lift Pit 3",
        location: "Basement 2 - Lift Pit 3",
        type: "Safety Hazard",
        severity: "moderate",
        occurredAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        reportedAt: new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString(),
        reportedBy: "Sanjay Shinde (Duty Technician)",
        status: "capa_assigned",
        description: "Small hydraulic pressure drip observed during morning inspection. Lift parked on G floor with warning barriers placed.",
        immediateAction: "Lift taken out of service, drip tray positioned, barricades deployed.",
        capaRequired: true,
        capaId: "CAPA-2026-101",
        escalationTriggered: false,
        createdAt: new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "INC-2026-102",
        propertyId: "prop-001",
        propertyName: "Devasya Gold - Commercial Tower",
        title: "Fire hose reel cabinet latch stuck on 8th Floor Corridor",
        location: "Floor 8 - Core A Lobby",
        type: "Fire Hazard",
        severity: "low",
        occurredAt: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
        reportedAt: new Date(now.getTime() - 119 * 60 * 60 * 1000).toISOString(),
        reportedBy: "Amit Patel (Security Patrol)",
        status: "closed",
        description: "Glass door latch jammed. Replaced hinges and applied lubrication. Tested opening smoothly.",
        immediateAction: "Hinges freed, tested by security and safety supervisor.",
        capaRequired: false,
        escalationTriggered: false,
        resolvedAt: new Date(now.getTime() - 116 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(now.getTime() - 119 * 60 * 60 * 1000).toISOString()
      }
    ],

    capas: [
      {
        id: "CAPA-2026-101",
        incidentId: "INC-2026-101",
        propertyId: "prop-001",
        action: "Replace hydraulic cylinder pressure seal and perform load test on Lift 3",
        actionType: "CORRECTIVE",
        rootCause: "Aging gasket seal ring after 8,000 duty hours.",
        owner: "Schindler Technical Support / Kailash Verma (FM)",
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: "high",
        sourceType: "incident",
        sourceId: "INC-2026-101",
        status: "in_progress",
        evidenceAttached: false,
        verificationApproved: false,
        createdAt: new Date(now.getTime() - 46 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "CAPA-2026-098",
        propertyId: "prop-001",
        action: "Housekeeping chemical storage SOP training and secondary containment tray install",
        actionType: "PREVENTIVE",
        rootCause: "Vendor staff lacked formal chemical SDS containment training.",
        owner: "EHS Manager",
        dueDate: "2026-08-30",
        priority: "medium",
        sourceType: "audit",
        sourceId: "AUD-2026-Q2",
        status: "closed",
        evidenceAttached: true,
        evidenceFileName: "Chemical_Training_Attendance_Aug2026.pdf",
        evidenceUrl: "/docs/compliance/Chemical_Training_Attendance_Aug2026.pdf",
        verificationApproved: true,
        verifiedBy: "Compliance Director",
        verifiedAt: "2026-08-31T17:00:00.000Z",
        closedAt: "2026-08-31T17:00:00.000Z",
        createdAt: "2026-08-15T09:00:00.000Z"
      }
    ],

    permits: [
      {
        id: "PTW-2026-042",
        propertyId: "prop-001",
        permitType: "HOT_WORK",
        title: "Chilled water riser pipe flange arc welding",
        contractor: "Voltas MEP Services",
        location: "Terrace Cooling Tower Riser C",
        validFrom: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        riskControls: [
          "10kg Dry Chemical Powder fire extinguisher on standby within 3m",
          "Fire blanket shielding surrounding combustible surfaces",
          "Continuous combustible gas sniffing before spark creation",
          "Trained fire watch assigned for 60 min post-work"
        ],
        status: "active",
        approvedBy: "Chief Safety Officer",
        approvedAt: new Date(now.getTime() - 110 * 60 * 1000).toISOString(),
        safetyOfficer: "Vikas Deshmukh (Safety Supervisor)",
        vendorPrerequisiteValid: true,
        vendorInsuranceExpiry: "2027-03-31",
        createdAt: new Date(now.getTime() - 180 * 60 * 1000).toISOString()
      },
      {
        id: "PTW-2026-043",
        propertyId: "prop-001",
        permitType: "HEIGHT_WORK",
        title: "Exterior glass curtain facade cleaning - North Elevation",
        contractor: "SkyClean Height Specialists",
        location: "North Elevation (Floors 12 to 22)",
        validFrom: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(now.getTime() + 32 * 60 * 60 * 1000).toISOString(),
        riskControls: [
          "Full body safety harness with dual lanyards and shock absorber",
          "Roof cradle anchorage pull test certification checked",
          "Ground drop zone cordoned with safety cones and warning tape"
        ],
        status: "approval_blocked", // BR-C11 Contractor insurance policy expired
        vendorPrerequisiteValid: false,
        vendorInsuranceExpiry: "2026-08-31", // Expired
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
      }
    ],

    risks: [
      {
        id: "RSK-101",
        propertyId: "prop-001",
        category: "Electrical & High Voltage",
        statement: "Grid power disruption during peak summer 100% cooling demand",
        likelihood: 3,
        impact: 4,
        inherentScore: 12,
        rating: "HIGH",
        mitigation: "Twin 1500 kVA synchronized Diesel Generators with automated ATS and 72-hour bulk fuel storage contract.",
        residualLikelihood: 1,
        residualImpact: 3,
        residualScore: 3,
        owner: "Chief MEP Engineer",
        status: "mitigated",
        createdAt: "2026-01-10T10:00:00.000Z"
      },
      {
        id: "RSK-102",
        propertyId: "prop-001",
        category: "Life Safety & Fire",
        statement: "Delay in annual Fire NOC renewal from Municipal Fire Directorate",
        likelihood: 2,
        impact: 5,
        inherentScore: 10,
        rating: "HIGH",
        mitigation: "60-day advance pre-audit by third-party fire engineer and automatic municipal fee remittance workflow.",
        residualLikelihood: 1,
        residualImpact: 2,
        residualScore: 2,
        owner: "Chief EHS Officer",
        status: "mitigated",
        createdAt: "2026-01-10T10:00:00.000Z"
      },
      {
        id: "RSK-103",
        propertyId: "prop-001",
        category: "Environmental & ESG",
        statement: "STP treated effluent discharge exceeding SPCB Biochemical Oxygen Demand (BOD) limits",
        likelihood: 2,
        impact: 4,
        inherentScore: 8,
        rating: "MEDIUM",
        mitigation: "Daily in-house dissolved oxygen testing, monthly NABL lab assays, automated aeration blower alerts.",
        residualLikelihood: 1,
        residualImpact: 2,
        residualScore: 2,
        owner: "Environmental Specialist",
        status: "mitigated",
        createdAt: "2026-02-01T11:00:00.000Z"
      },
      {
        id: "RSK-104",
        propertyId: "prop-001",
        category: "Physical Security & Access",
        statement: "Tailgating or unauthorized access into critical server / UPS rooms",
        likelihood: 3,
        impact: 3,
        inherentScore: 9,
        rating: "MEDIUM",
        mitigation: "Dual-factor biometric access locks, anti-tailgating turnstiles, 24/7 motion CCTV with AI perimeter alerts.",
        residualLikelihood: 1,
        residualImpact: 2,
        residualScore: 2,
        owner: "Head of Physical Security",
        status: "mitigated",
        createdAt: "2026-02-15T09:00:00.000Z"
      }
    ],

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
    propertyName: params.propertyName || "Devasya Gold - Commercial Tower",
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

  if (filters?.propertyId && filters.propertyId !== "ALL") {
    list = list.filter(o => !o.propertyId || o.propertyId === filters.propertyId);
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
    propertyName: params.propertyName || "Devasya Gold - Commercial Tower",
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
    propertyName: "Devasya Gold - Commercial Tower",
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

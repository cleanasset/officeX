import fs from 'fs';
import path from 'path';
import {
  computeFullLeaseSummary,
  calculateInvoice,
  calculateAgingBuckets,
  calculateNOI,
  calculateCapRate,
  calculateWALT,
  calculateOccupancy,
  generate12MonthForecast,
  round2
} from './rent-roll-engine';

export interface OrgEntity {
  id: string;
  name: string;
  pan: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  fyStartMonth: number;
  invoicePrefix: string;
  currency: string;
}

export interface PropertyEntity {
  id: string;
  orgId: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  microMarket: string;
  pincode: string;
  grade: "A" | "B" | "C" | "A+" | "B+";
  totalArea: number;
  chargeableArea: number;
  occupancyTargetPct: number;
  imageUrl?: string;
  assetValue?: number; // for Cap Rate calculation
  ownerEmail?: string;
  ownerUserId?: string;
  ownerName?: string;
}

export interface SpaceEntity {
  id: string;
  propertyId: string;
  buildingName: string;
  floorNumber: number;
  unitNumber: string;
  spaceType: "office" | "retail" | "food_court" | "warehouse" | "storage";
  carpetArea: number;
  chargeableArea: number;
  standardRatePsf: number;
  standardCamPsf: number;
  status: "available" | "leased" | "in_negotiation" | "under_fitout";
  currentLeaseId?: string;
}

export interface TenantEntity {
  id: string;
  orgId: string;
  tenantCode: string;
  tradeName: string;
  legalName: string;
  industry: string;
  pan: string;
  gstin: string;
  tan?: string;
  cin?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  status: "active" | "inactive" | "prospect" | "blacklisted";
  creditLimit: number;
  paymentTermsDays: number;
  notes?: string;
  createdAt: string;
}

export interface LeaseEntity {
  id: string;
  orgId: string;
  propertyId: string;
  propertyName: string;
  spaceId: string;
  unitNumber: string;
  floorNumber: number;
  tenantId: string;
  tenantName: string;
  leaseCode: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  handoverDate?: string;
  fitoutPeriodDays: number;
  rentFreePeriodDays: number;
  carpetArea: number;
  chargeableArea: number;
  monthlyRent: number; // Base rent monthly
  baseRentPsf: number;
  camRatePsf: number;
  camMonthly: number;
  utilityFixedMonthly: number;
  parkingChargesMonthly: number;
  signageChargesMonthly: number;
  otherChargesMonthly: number;
  totalMonthlyGross: number;
  annualRentGross: number;
  securityDepositMonths: number;
  securityDepositAmount: number;
  securityDepositPaid: number;
  securityDepositBank?: string;
  securityDepositBgReference?: string;
  escalationPct: number;
  escalationFrequencyMonths: number;
  nextEscalationDate: string;
  lockInMonths: number;
  lockInEndDate: string;
  noticePeriodDays: number;
  status: "draft" | "active" | "under_notice" | "expired" | "terminated" | "holdover";
  renewalStatus: "not_due" | "approaching" | "under_negotiation" | "renewed" | "vacating";
  billingFrequency: "monthly" | "quarterly" | "annual";
  billingDueDay: number;
  gstRate: number;
  tdsRate: number;
  brokerName?: string;
  brokeragePaid: number;
  terminationDate?: string;
  terminationReason?: string;
  signedAgreementUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationEntity {
  id: string;
  leaseId: string;
  leaseCode: string;
  tenantName: string;
  propertyName: string;
  escalationDate: string;
  previousRent: number;
  newRent: number;
  escalationPct: number;
  calculatedIncrease: number;
  status: "pending" | "applied" | "waived" | "disputed";
  appliedAt?: string;
  appliedBy?: string;
  notes?: string;
}

export interface InvoiceEntity {
  id: string;
  orgId: string;
  leaseId: string;
  leaseCode: string;
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  fyYear: string;
  invoiceDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  baseRent: number;
  camCharges: number;
  utilityCharges: number;
  otherCharges: number;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  grossTotal: number;
  tdsDeducted: number;
  netPayable: number;
  amountPaid: number;
  balanceDue: number;
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled";
  paidDate?: string;
  paymentMode?: string;
  referenceNumber?: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface CollectionEntity {
  id: string;
  orgId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  leaseId: string;
  leaseCode: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  receiptNumber: string;
  paymentDate: string;
  paymentMode: "neft_rtgs" | "upi" | "cheque" | "ach" | "credit_card";
  referenceNumber: string; // UTR
  amountReceived: number;
  tdsDeducted: number;
  bankCharges: number;
  netCredited: number;
  bankAccount: string;
  notes?: string;
  createdAt: string;
}

export interface ExpenseEntity {
  id: string;
  orgId: string;
  propertyId: string;
  propertyName: string;
  expenseCategory: "cam" | "property_tax" | "insurance" | "utility_water" | "utility_power" | "repairs_maintenance" | "statutory_fees" | "mgmt_fee" | "other";
  vendorName: string;
  invoiceNumber?: string;
  expenseDate: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  paidDate?: string;
  paymentStatus: "paid" | "pending" | "scheduled";
  description: string;
  createdAt: string;
}

export interface NoticeEntity {
  id: string;
  leaseId: string;
  leaseCode: string;
  tenantName: string;
  propertyName: string;
  noticeDate: string;
  effectiveDate: string;
  noticeReason: "relocation" | "downsizing" | "cost" | "lease_expiry" | "dispute" | "other";
  initiatedBy: "tenant" | "landlord";
  remarks?: string;
  penaltyAmount: number;
  status: "pending" | "accepted" | "settled" | "withdrawn";
  createdAt: string;
}

export interface AlertEntity {
  id: string;
  orgId: string;
  alertType: string;
  title: string;
  message: string;
  entityType: "lease" | "invoice" | "collection" | "property";
  entityId?: string;
  severity: "info" | "warning" | "critical";
  isRead: boolean;
  triggerDate: string;
  createdAt: string;
}

export interface AuditLogEntity {
  id: string;
  leaseId?: string;
  entityName: string;
  action: string;
  oldValues?: any;
  newValues?: any;
  changedBy: string;
  timestamp: string;
}

export interface RentRollDatabase {
  organization: OrgEntity;
  properties: PropertyEntity[];
  spaces: SpaceEntity[];
  tenants: TenantEntity[];
  leases: LeaseEntity[];
  escalations: EscalationEntity[];
  invoices: InvoiceEntity[];
  collections: CollectionEntity[];
  expenses: ExpenseEntity[];
  notices: NoticeEntity[];
  alerts: AlertEntity[];
  auditLogs: AuditLogEntity[];
  config: {
    leaseExpiryAlertDays: number;
    escalationAlertDays: number;
    defaultGstPct: number;
    defaultPaymentDueDays: number;
    currency: string;
    asOfDate: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rent-roll-db.json');

// Ensure directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial Seed Database Builder
function getInitialSeedDatabase(): RentRollDatabase {
  const org: OrgEntity = {
    id: "org-officex-001",
    name: "OfficeX Asset Management India Pvt Ltd",
    pan: "AAFCO1234F",
    gstin: "27AAFCO1234F1Z5",
    address: "Level 14, Tower 2, One International Center, Senapati Bapat Marg, Prabhadevi",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400013",
    fyStartMonth: 4,
    invoicePrefix: "INV-2026",
    currency: "INR",
  };

  const properties: PropertyEntity[] = [
    {
      id: "PROP-001",
      orgId: org.id,
      name: "One BKC (Apex Tower)",
      type: "Commercial IT / BFSI Park",
      address: "Bandra Kurla Complex, Bandra East",
      city: "Mumbai",
      state: "Maharashtra",
      microMarket: "BKC Prime",
      pincode: "400051",
      grade: "A+",
      totalArea: 650000,
      chargeableArea: 620000,
      occupancyTargetPct: 95,
      assetValue: 18500000000, // ₹1,850 Cr
    },
    {
      id: "PROP-002",
      orgId: org.id,
      name: "Maker Maxity Mumbai",
      type: "Grade-A Commercial Office",
      address: "BKC Road, Near Kalanagar, Bandra East",
      city: "Mumbai",
      state: "Maharashtra",
      microMarket: "BKC Central",
      pincode: "400051",
      grade: "A+",
      totalArea: 480000,
      chargeableArea: 450000,
      occupancyTargetPct: 92,
      assetValue: 12500000000, // ₹1,250 Cr
    },
    {
      id: "PROP-003",
      orgId: org.id,
      name: "Godrej BKC Horizon",
      type: "Commercial Office Complex",
      address: "Plot C-68, G Block, BKC",
      city: "Mumbai",
      state: "Maharashtra",
      microMarket: "BKC East",
      pincode: "400051",
      grade: "A",
      totalArea: 520000,
      chargeableArea: 490000,
      occupancyTargetPct: 90,
      assetValue: 11000000000, // ₹1,100 Cr
    },
    {
      id: "PROP-004",
      orgId: org.id,
      name: "Shivalik Shilp, Ahmedabad",
      type: "Commercial / FinTech Center",
      address: "ISCON Cross Road, SG Highway",
      city: "Ahmedabad",
      state: "Gujarat",
      microMarket: "GIFT City Corridor / SG Highway",
      pincode: "380015",
      grade: "A",
      totalArea: 320000,
      chargeableArea: 300000,
      occupancyTargetPct: 88,
      assetValue: 3500000000, // ₹350 Cr
    },
    {
      id: "PROP-005",
      orgId: org.id,
      name: "Business Hub, Pune",
      type: "IT / ITES Park",
      address: "Phase 1, Hinjewadi Rajiv Gandhi Infotech Park",
      city: "Pune",
      state: "Maharashtra",
      microMarket: "Hinjewadi Phase 1",
      pincode: "411057",
      grade: "A",
      totalArea: 390000,
      chargeableArea: 375000,
      occupancyTargetPct: 90,
      assetValue: 4200000000, // ₹420 Cr
    }
  ];

  const spaces: SpaceEntity[] = [
    { id: "SPC-101", propertyId: "PROP-001", buildingName: "Tower A", floorNumber: 4, unitNumber: "Suite 401 (North Wing)", spaceType: "office", carpetArea: 21500, chargeableArea: 25000, standardRatePsf: 240, standardCamPsf: 24, status: "leased", currentLeaseId: "LEASE-001" },
    { id: "SPC-102", propertyId: "PROP-001", buildingName: "Tower A", floorNumber: 8, unitNumber: "Entire Horizon Plate", spaceType: "office", carpetArea: 27800, chargeableArea: 32000, standardRatePsf: 285, standardCamPsf: 24, status: "leased", currentLeaseId: "LEASE-002" },
    { id: "SPC-103", propertyId: "PROP-002", buildingName: "Block 1", floorNumber: 5, unitNumber: "Suite 501", spaceType: "office", carpetArea: 15800, chargeableArea: 18500, standardRatePsf: 250, standardCamPsf: 22, status: "leased", currentLeaseId: "LEASE-003" },
    { id: "SPC-104", propertyId: "PROP-002", buildingName: "Block 2", floorNumber: 11, unitNumber: "Suite 1101 (West Wing)", spaceType: "office", carpetArea: 12000, chargeableArea: 14000, standardRatePsf: 210, standardCamPsf: 22, status: "leased", currentLeaseId: "LEASE-006" },
    { id: "SPC-105", propertyId: "PROP-003", buildingName: "Main Wing", floorNumber: 6, unitNumber: "Suite 602", spaceType: "office", carpetArea: 11900, chargeableArea: 14000, standardRatePsf: 195, standardCamPsf: 20, status: "leased", currentLeaseId: "LEASE-004" },
    { id: "SPC-106", propertyId: "PROP-003", buildingName: "Main Wing", floorNumber: 3, unitNumber: "Suite 301 (South Wing)", spaceType: "office", carpetArea: 18900, chargeableArea: 22000, standardRatePsf: 220, standardCamPsf: 20, status: "leased", currentLeaseId: "LEASE-007" },
    { id: "SPC-107", propertyId: "PROP-004", buildingName: "Tower 1", floorNumber: 7, unitNumber: "Suite 701", spaceType: "office", carpetArea: 24000, chargeableArea: 28000, standardRatePsf: 85, standardCamPsf: 15, status: "leased", currentLeaseId: "LEASE-008" },
    { id: "SPC-108", propertyId: "PROP-004", buildingName: "Tower 1", floorNumber: 4, unitNumber: "Suite 401", spaceType: "office", carpetArea: 10200, chargeableArea: 12000, standardRatePsf: 65, standardCamPsf: 15, status: "leased", currentLeaseId: "LEASE-009" },
    { id: "SPC-109", propertyId: "PROP-005", buildingName: "Block A", floorNumber: 2, unitNumber: "Suite 201 (Full Floor)", spaceType: "office", carpetArea: 30000, chargeableArea: 35000, standardRatePsf: 75, standardCamPsf: 16, status: "leased", currentLeaseId: "LEASE-005" },
    { id: "SPC-110", propertyId: "PROP-005", buildingName: "Block B", floorNumber: 5, unitNumber: "Suite 502", spaceType: "office", carpetArea: 7200, chargeableArea: 8500, standardRatePsf: 55, standardCamPsf: 16, status: "leased", currentLeaseId: "LEASE-010" },
  ];

  const tenants: TenantEntity[] = [
    { id: "TEN-101", orgId: org.id, tenantCode: "TNT-001", tradeName: "Tata Digital Ltd", legalName: "Tata Digital Private Limited", industry: "E-Commerce / FinTech", pan: "AABCT1234D", gstin: "27AABCT1234D1Z2", contactPerson: "Rajesh Sharma (VP Facilities)", contactEmail: "rajesh.sharma@tatadigital.com", contactPhone: "+91 98201 44552", billingAddress: "Army & Navy Building, 148 MG Road, Fort", billingCity: "Mumbai", billingState: "Maharashtra", billingPincode: "400001", status: "active", creditLimit: 50000000, paymentTermsDays: 15, createdAt: "2024-08-01" },
    { id: "TEN-102", orgId: org.id, tenantCode: "TNT-002", tradeName: "Google Enterprise Services", legalName: "Google India Private Limited", industry: "Technology / Cloud", pan: "AABCG5678E", gstin: "27AABCG5678E1Z9", contactPerson: "Sarah Jenkins (Director REWS)", contactEmail: "sjenkins@google.com", contactPhone: "+91 98110 88771", billingAddress: "Unit 1, 8th Floor, BKC Apex, Bandra East", billingCity: "Mumbai", billingState: "Maharashtra", billingPincode: "400051", status: "active", creditLimit: 100000000, paymentTermsDays: 15, createdAt: "2024-09-15" },
    { id: "TEN-103", orgId: org.id, tenantCode: "TNT-003", tradeName: "Deloitte Digital", legalName: "Deloitte Touche Tohmatsu India LLP", industry: "Professional Services / Consulting", pan: "AACFD9988K", gstin: "27AACFD9988K1Z3", contactPerson: "Vikram Mehta (Partner Operations)", contactEmail: "vmehta@deloitte.com", contactPhone: "+91 98332 11223", billingAddress: "Indiabulls Finance Centre, Tower 3, Elphinstone Mill", billingCity: "Mumbai", billingState: "Maharashtra", billingPincode: "400013", status: "active", creditLimit: 40000000, paymentTermsDays: 15, createdAt: "2023-12-01" },
    { id: "TEN-104", orgId: org.id, tenantCode: "TNT-004", tradeName: "Wipro Cloud Infra", legalName: "Wipro Limited", industry: "IT Infrastructure", pan: "AAACW1122L", gstin: "27AAACW1122L1Z8", contactPerson: "Anil Deshmukh (Head Admin)", contactEmail: "anil.deshmukh@wipro.com", contactPhone: "+91 99203 77884", billingAddress: "Doddakannelli, Sarjapur Road", billingCity: "Bangalore", billingState: "Karnataka", billingPincode: "560035", status: "active", creditLimit: 30000000, paymentTermsDays: 15, createdAt: "2023-01-10" },
    { id: "TEN-105", orgId: org.id, tenantCode: "TNT-005", tradeName: "Persistent Systems", legalName: "Persistent Systems Limited", industry: "Software Engineering", pan: "AABCP4455N", gstin: "27AABCP4455N1Z5", contactPerson: "Pooja Kulkarni (VP Infrastructure)", contactEmail: "pooja_k@persistent.com", contactPhone: "+91 98500 33441", billingAddress: "Bhageerath, 402 Senapati Bapat Road", billingCity: "Pune", billingState: "Maharashtra", billingPincode: "411016", status: "active", creditLimit: 35000000, paymentTermsDays: 15, createdAt: "2024-06-01" },
    { id: "TEN-106", orgId: org.id, tenantCode: "TNT-006", tradeName: "McKinsey & Company", legalName: "McKinsey & Company India LLP", industry: "Management Consulting", pan: "AACFM7788R", gstin: "27AACFM7788R1Z1", contactPerson: "Arjun Singhania (Head Facilities)", contactEmail: "arjun_singhania@mckinsey.com", contactPhone: "+91 98200 99887", billingAddress: "Express Towers, 21st Floor, Nariman Point", billingCity: "Mumbai", billingState: "Maharashtra", billingPincode: "400021", status: "active", creditLimit: 50000000, paymentTermsDays: 15, createdAt: "2025-03-01" },
    { id: "TEN-107", orgId: org.id, tenantCode: "TNT-007", tradeName: "HSBC Global Services", legalName: "HSBC Electronic Data Processing India Pvt Ltd", industry: "Banking & Global Processing", pan: "AAACH8899M", gstin: "27AAACH8899M1Z4", contactPerson: "Kavita Rao (Corporate Real Estate)", contactEmail: "kavita.rao@hsbc.co.in", contactPhone: "+91 98190 22334", billingAddress: "52/60 MG Road, Fort", billingCity: "Mumbai", billingState: "Maharashtra", billingPincode: "400001", status: "active", creditLimit: 60000000, paymentTermsDays: 15, createdAt: "2024-05-01" },
    { id: "TEN-108", orgId: org.id, tenantCode: "TNT-008", tradeName: "Infosys BPM Ltd", legalName: "Infosys BPM Limited", industry: "Business Process Management", pan: "AAACI3344J", gstin: "24AAACI3344J1Z7", contactPerson: "Rohan Patel (Regional Admin Head)", contactEmail: "rohan_patel@infosys.com", contactPhone: "+91 97250 11223", billingAddress: "Plot No. 44, Electronics City, Hosur Road", billingCity: "Bangalore", billingState: "Karnataka", billingPincode: "560100", status: "active", creditLimit: 30000000, paymentTermsDays: 15, createdAt: "2025-02-01" },
    { id: "TEN-109", orgId: org.id, tenantCode: "TNT-009", tradeName: "Adani Digital Labs", legalName: "Adani Enterprises Limited - Digital Division", industry: "Digital & Cloud Solutions", pan: "AAACA5566K", gstin: "24AAACA5566K1Z6", contactPerson: "Deepak Trivedi (Head Real Estate)", contactEmail: "deepak.trivedi@adani.com", contactPhone: "+91 99099 88776", billingAddress: "Adani Corporate House, Shantigram, SG Highway", billingCity: "Ahmedabad", billingState: "Gujarat", billingPincode: "382421", status: "active", creditLimit: 20000000, paymentTermsDays: 15, createdAt: "2024-10-15" },
    { id: "TEN-110", orgId: org.id, tenantCode: "TNT-010", tradeName: "Tech Mahindra Ltd", legalName: "Tech Mahindra Limited", industry: "Telecom & IT Solutions", pan: "AAACT8877B", gstin: "27AAACT8877B1Z0", contactPerson: "Sanjay Joshi (Lead Facilities)", contactEmail: "sanjay.joshi@techmahindra.com", contactPhone: "+91 98901 66554", billingAddress: "Gateway Building, Apollo Bunder", billingCity: "Mumbai", billingState: "Maharashtra", billingPincode: "400001", status: "active", creditLimit: 15000000, paymentTermsDays: 15, createdAt: "2025-07-01" },
  ];

  const rawLeases: Array<{
    id: string;
    propertyId: string;
    spaceId: string;
    unitNumber: string;
    floorNumber: number;
    tenantId: string;
    leaseCode: string;
    startDate: string;
    endDate: string;
    lockInEndDate: string;
    noticePeriodDays: number;
    chargeableArea: number;
    carpetArea: number;
    monthlyRent: number;
    camRatePsf: number;
    utilityFixedMonthly: number;
    escalationPct: number;
    escalationFrequencyMonths: number;
    nextEscalationDate: string;
    securityDepositPaid: number;
    status: "active" | "under_notice" | "expired" | "terminated";
    renewalStatus: "not_due" | "approaching" | "under_negotiation" | "renewed" | "vacating";
  }> = [
    {
      id: "LEASE-001", propertyId: "PROP-001", spaceId: "SPC-101", unitNumber: "Suite 401 (North Wing)", floorNumber: 4,
      tenantId: "TEN-101", leaseCode: "LSE-2024-001", startDate: "2024-09-01", endDate: "2029-08-31", lockInEndDate: "2027-08-31",
      noticePeriodDays: 90, chargeableArea: 25000, carpetArea: 21500, monthlyRent: 6000000, camRatePsf: 24, utilityFixedMonthly: 210000,
      escalationPct: 5, escalationFrequencyMonths: 24, nextEscalationDate: "2026-09-01", securityDepositPaid: 36000000, status: "active", renewalStatus: "not_due"
    },
    {
      id: "LEASE-002", propertyId: "PROP-001", spaceId: "SPC-102", unitNumber: "Entire Horizon Plate", floorNumber: 8,
      tenantId: "TEN-102", leaseCode: "LSE-2024-002", startDate: "2024-10-15", endDate: "2030-10-14", lockInEndDate: "2028-10-14",
      noticePeriodDays: 120, chargeableArea: 32000, carpetArea: 27800, monthlyRent: 9120000, camRatePsf: 24, utilityFixedMonthly: 285000,
      escalationPct: 5, escalationFrequencyMonths: 24, nextEscalationDate: "2026-10-15", securityDepositPaid: 54720000, status: "active", renewalStatus: "not_due"
    },
    {
      id: "LEASE-003", propertyId: "PROP-002", spaceId: "SPC-103", unitNumber: "Suite 501", floorNumber: 5,
      tenantId: "TEN-103", leaseCode: "LSE-2024-003", startDate: "2024-01-01", endDate: "2028-12-31", lockInEndDate: "2026-12-31",
      noticePeriodDays: 90, chargeableArea: 18500, carpetArea: 15800, monthlyRent: 4625000, camRatePsf: 22, utilityFixedMonthly: 155000,
      escalationPct: 5, escalationFrequencyMonths: 36, nextEscalationDate: "2027-01-01", securityDepositPaid: 27750000, status: "active", renewalStatus: "not_due"
    },
    {
      id: "LEASE-004", propertyId: "PROP-003", spaceId: "SPC-105", unitNumber: "Suite 602", floorNumber: 6,
      tenantId: "TEN-104", leaseCode: "LSE-2023-004", startDate: "2023-02-15", endDate: "2027-02-14", lockInEndDate: "2025-02-14",
      noticePeriodDays: 90, chargeableArea: 14000, carpetArea: 11900, monthlyRent: 2730000, camRatePsf: 20, utilityFixedMonthly: 95000,
      escalationPct: 7, escalationFrequencyMonths: 36, nextEscalationDate: "2026-02-15", securityDepositPaid: 16380000, status: "active", renewalStatus: "approaching"
    },
    {
      id: "LEASE-005", propertyId: "PROP-005", spaceId: "SPC-109", unitNumber: "Suite 201 (Full Floor)", floorNumber: 2,
      tenantId: "TEN-105", leaseCode: "LSE-2024-005", startDate: "2024-07-01", endDate: "2029-06-30", lockInEndDate: "2027-06-30",
      noticePeriodDays: 90, chargeableArea: 35000, carpetArea: 30000, monthlyRent: 2625000, camRatePsf: 16, utilityFixedMonthly: 180000,
      escalationPct: 5, escalationFrequencyMonths: 36, nextEscalationDate: "2027-07-01", securityDepositPaid: 15750000, status: "active", renewalStatus: "not_due"
    },
    {
      id: "LEASE-006", propertyId: "PROP-002", spaceId: "SPC-104", unitNumber: "Suite 1101 (West Wing)", floorNumber: 11,
      tenantId: "TEN-106", leaseCode: "LSE-2025-006", startDate: "2025-04-01", endDate: "2030-03-31", lockInEndDate: "2028-03-31",
      noticePeriodDays: 120, chargeableArea: 14000, carpetArea: 12000, monthlyRent: 2940000, camRatePsf: 22, utilityFixedMonthly: 110000,
      escalationPct: 7, escalationFrequencyMonths: 24, nextEscalationDate: "2027-04-01", securityDepositPaid: 17640000, status: "active", renewalStatus: "not_due"
    },
    {
      id: "LEASE-007", propertyId: "PROP-003", spaceId: "SPC-106", unitNumber: "Suite 301 (South Wing)", floorNumber: 3,
      tenantId: "TEN-107", leaseCode: "LSE-2024-007", startDate: "2024-06-01", endDate: "2029-05-31", lockInEndDate: "2027-05-31",
      noticePeriodDays: 90, chargeableArea: 22000, carpetArea: 18900, monthlyRent: 4840000, camRatePsf: 20, utilityFixedMonthly: 175000,
      escalationPct: 5, escalationFrequencyMonths: 36, nextEscalationDate: "2027-06-01", securityDepositPaid: 29040000, status: "active", renewalStatus: "not_due"
    },
    {
      id: "LEASE-008", propertyId: "PROP-004", spaceId: "SPC-107", unitNumber: "Suite 701", floorNumber: 7,
      tenantId: "TEN-108", leaseCode: "LSE-2025-008", startDate: "2025-03-01", endDate: "2030-02-28", lockInEndDate: "2028-02-28",
      noticePeriodDays: 90, chargeableArea: 28000, carpetArea: 24000, monthlyRent: 2380000, camRatePsf: 15, utilityFixedMonthly: 140000,
      escalationPct: 5, escalationFrequencyMonths: 24, nextEscalationDate: "2027-03-01", securityDepositPaid: 14280000, status: "active", renewalStatus: "not_due"
    },
    {
      id: "LEASE-009", propertyId: "PROP-004", spaceId: "SPC-108", unitNumber: "Suite 401", floorNumber: 4,
      tenantId: "TEN-109", leaseCode: "LSE-2024-009", startDate: "2024-11-15", endDate: "2028-11-14", lockInEndDate: "2026-11-14",
      noticePeriodDays: 60, chargeableArea: 12000, carpetArea: 10200, monthlyRent: 780000, camRatePsf: 15, utilityFixedMonthly: 65000,
      escalationPct: 7, escalationFrequencyMonths: 24, nextEscalationDate: "2026-11-15", securityDepositPaid: 4680000, status: "under_notice", renewalStatus: "vacating"
    },
    {
      id: "LEASE-010", propertyId: "PROP-005", spaceId: "SPC-110", unitNumber: "Suite 502", floorNumber: 5,
      tenantId: "TEN-110", leaseCode: "LSE-2025-010", startDate: "2025-08-01", endDate: "2028-07-31", lockInEndDate: "2027-07-31",
      noticePeriodDays: 60, chargeableArea: 8500, carpetArea: 7200, monthlyRent: 467500, camRatePsf: 16, utilityFixedMonthly: 48000,
      escalationPct: 5, escalationFrequencyMonths: 24, nextEscalationDate: "2027-08-01", securityDepositPaid: 2805000, status: "active", renewalStatus: "not_due"
    },
  ];

  const leases: LeaseEntity[] = rawLeases.map(raw => {
    const prop = properties.find(p => p.id === raw.propertyId)!;
    const tnt = tenants.find(t => t.id === raw.tenantId)!;
    const summary = computeFullLeaseSummary({
      chargeableArea: raw.chargeableArea,
      carpetArea: raw.carpetArea,
      monthlyRent: raw.monthlyRent,
      camRatePsf: raw.camRatePsf,
      utilityFixedMonthly: raw.utilityFixedMonthly,
      startDate: raw.startDate,
      endDate: raw.endDate,
      lockInMonths: 36,
      escalationPct: raw.escalationPct,
      escalationFrequencyMonths: raw.escalationFrequencyMonths,
      securityDepositMonths: 6,
      securityDepositPaid: raw.securityDepositPaid,
    });

    return {
      id: raw.id,
      orgId: org.id,
      propertyId: raw.propertyId,
      propertyName: prop.name,
      spaceId: raw.spaceId,
      unitNumber: raw.unitNumber,
      floorNumber: raw.floorNumber,
      tenantId: raw.tenantId,
      tenantName: tnt.tradeName,
      leaseCode: raw.leaseCode,
      startDate: raw.startDate,
      endDate: raw.endDate,
      fitoutPeriodDays: 0,
      rentFreePeriodDays: 0,
      carpetArea: raw.carpetArea,
      chargeableArea: raw.chargeableArea,
      monthlyRent: raw.monthlyRent,
      baseRentPsf: summary.baseRentPsf,
      camRatePsf: raw.camRatePsf,
      camMonthly: summary.camMonthly,
      utilityFixedMonthly: raw.utilityFixedMonthly,
      parkingChargesMonthly: 0,
      signageChargesMonthly: 0,
      otherChargesMonthly: 0,
      totalMonthlyGross: summary.totalMonthlyGross,
      annualRentGross: summary.annualRentGross,
      securityDepositMonths: 6,
      securityDepositAmount: summary.securityDepositRequired,
      securityDepositPaid: raw.securityDepositPaid,
      securityDepositBank: "HDFC Bank / Corporate Guarantee",
      securityDepositBgReference: `BG-2024-${raw.id.split('-')[1]}`,
      escalationPct: raw.escalationPct,
      escalationFrequencyMonths: raw.escalationFrequencyMonths,
      nextEscalationDate: raw.nextEscalationDate,
      lockInMonths: 36,
      lockInEndDate: raw.lockInEndDate,
      noticePeriodDays: raw.noticePeriodDays,
      status: raw.status,
      renewalStatus: raw.renewalStatus,
      billingFrequency: "monthly",
      billingDueDay: 5,
      gstRate: 18,
      tdsRate: 10,
      brokerName: "JLL India Commercial Advisory",
      brokeragePaid: round2(raw.monthlyRent * 0.5),
      notes: `Standard long-term commercial lease agreement registered under Maharashtra Rent Control Act.`,
      createdAt: raw.startDate,
      updatedAt: "2026-09-01T00:00:00Z"
    };
  });

  const escalations: EscalationEntity[] = [
    {
      id: "ESC-001",
      leaseId: "LEASE-001",
      leaseCode: "LSE-2024-001",
      tenantName: "Tata Digital Ltd",
      propertyName: "One BKC (Apex Tower)",
      escalationDate: "2026-09-01",
      previousRent: 6000000,
      newRent: 6300000,
      escalationPct: 5,
      calculatedIncrease: 300000,
      status: "applied",
      appliedAt: "2026-09-01T10:00:00Z",
      appliedBy: "Finance Admin",
      notes: "First scheduled 5% escalation applied on Year 2 completion."
    },
    {
      id: "ESC-002",
      leaseId: "LEASE-002",
      leaseCode: "LSE-2024-002",
      tenantName: "Google Enterprise Services",
      propertyName: "One BKC (Apex Tower)",
      escalationDate: "2026-10-15",
      previousRent: 9120000,
      newRent: 9576000,
      escalationPct: 5,
      calculatedIncrease: 456000,
      status: "pending",
      notes: "Upcoming escalation notice sent to tenant 30 days prior."
    },
    {
      id: "ESC-003",
      leaseId: "LEASE-004",
      leaseCode: "LSE-2023-004",
      tenantName: "Wipro Cloud Infra",
      propertyName: "Godrej BKC Horizon",
      escalationDate: "2026-02-15",
      previousRent: 2551401,
      newRent: 2730000,
      escalationPct: 7,
      calculatedIncrease: 178599,
      status: "applied",
      appliedAt: "2026-02-15T09:00:00Z",
      appliedBy: "Property Manager",
      notes: "7% escalation applied as per contract."
    },
    {
      id: "ESC-004",
      leaseId: "LEASE-009",
      leaseCode: "LSE-2024-009",
      tenantName: "Adani Digital Labs",
      propertyName: "Shivalik Shilp, Ahmedabad",
      escalationDate: "2026-11-15",
      previousRent: 780000,
      newRent: 834600,
      escalationPct: 7,
      calculatedIncrease: 54600,
      status: "waived",
      notes: "Escalation waived due to notice of early termination."
    }
  ];

  const rawInvoices = [
    { id: "INV-101", invoiceNo: "INV-2026-091", leaseId: "LEASE-001", paid: true, paidDate: "2026-09-03", mode: "neft_rtgs", utr: "HDFCR520260903008912" },
    { id: "INV-102", invoiceNo: "INV-2026-092", leaseId: "LEASE-002", paid: true, paidDate: "2026-09-02", mode: "neft_rtgs", utr: "CITIN20260902991204" },
    { id: "INV-103", invoiceNo: "INV-2026-093", leaseId: "LEASE-003", paid: false }, // Overdue
    { id: "INV-104", invoiceNo: "INV-2026-094", leaseId: "LEASE-004", paid: true, paidDate: "2026-09-05", mode: "neft_rtgs", utr: "ICICN20260905128790" },
    { id: "INV-105", invoiceNo: "INV-2026-095", leaseId: "LEASE-005", paid: true, paidDate: "2026-09-04", mode: "neft_rtgs", utr: "KOTKR20260904556789" },
    { id: "INV-106", invoiceNo: "INV-2026-096", leaseId: "LEASE-006", paid: true, paidDate: "2026-09-01", mode: "neft_rtgs", utr: "HSBC520260901440210" },
    { id: "INV-107", invoiceNo: "INV-2026-097", leaseId: "LEASE-007", paid: false }, // Issued / Pending
    { id: "INV-108", invoiceNo: "INV-2026-098", leaseId: "LEASE-008", paid: true, paidDate: "2026-09-04", mode: "neft_rtgs", utr: "SBIN520260904887621" },
    { id: "INV-109", invoiceNo: "INV-2026-099", leaseId: "LEASE-009", paid: false }, // Overdue
    { id: "INV-110", invoiceNo: "INV-2026-100", leaseId: "LEASE-010", paid: true, paidDate: "2026-09-05", mode: "neft_rtgs", utr: "AXISR20260905334521" },
  ];

  const invoices: InvoiceEntity[] = rawInvoices.map(raw => {
    const l = leases.find(item => item.id === raw.leaseId)!;
    const invCalc = calculateInvoice({
      baseRent: l.monthlyRent,
      camCharges: l.camMonthly,
      utilityCharges: l.utilityFixedMonthly,
      otherCharges: 0,
      gstRate: 18,
      tdsRate: 10,
      dueDate: "2026-09-05",
      amountPaid: raw.paid ? round2(l.monthlyRent + l.camMonthly + l.utilityFixedMonthly + ((l.monthlyRent + l.camMonthly + l.utilityFixedMonthly) * 0.18) - (l.monthlyRent * 0.10)) : 0
    });

    let status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled" = raw.paid ? "paid" : "overdue";
    if (!raw.paid && raw.id === "INV-107") {
      status = "issued";
    }

    return {
      id: raw.id,
      orgId: org.id,
      leaseId: l.id,
      leaseCode: l.leaseCode,
      propertyId: l.propertyId,
      propertyName: l.propertyName,
      tenantId: l.tenantId,
      tenantName: l.tenantName,
      invoiceNumber: raw.invoiceNo,
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-05",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      baseRent: l.monthlyRent,
      camCharges: l.camMonthly,
      utilityCharges: l.utilityFixedMonthly,
      otherCharges: 0,
      subtotal: invCalc.subtotal,
      gstRate: 18,
      gstAmount: invCalc.gstAmount,
      grossTotal: invCalc.grossTotal,
      tdsDeducted: invCalc.tdsDeducted,
      netPayable: invCalc.netPayable,
      amountPaid: raw.paid ? invCalc.netPayable : 0,
      balanceDue: raw.paid ? 0 : invCalc.netPayable,
      status: status,
      paidDate: raw.paidDate,
      paymentMode: raw.mode,
      referenceNumber: raw.utr,
      createdAt: "2026-09-01T08:00:00Z"
    };
  });

  const collections: CollectionEntity[] = rawInvoices
    .filter(i => i.paid)
    .map((raw, idx) => {
      const inv = invoices.find(item => item.id === raw.id)!;
      return {
        id: `REC-2026-90${idx + 1}`,
        orgId: org.id,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        leaseId: inv.leaseId,
        leaseCode: inv.leaseCode,
        tenantId: inv.tenantId,
        tenantName: inv.tenantName,
        propertyName: inv.propertyName,
        receiptNumber: `REC-2026-90${idx + 1}`,
        paymentDate: raw.paidDate!,
        paymentMode: "neft_rtgs",
        referenceNumber: raw.utr!,
        amountReceived: inv.netPayable,
        tdsDeducted: inv.tdsDeducted,
        bankCharges: 0,
        netCredited: inv.netPayable,
        bankAccount: "HDFC Bank A/C 502000889912 - OfficeX Escrow",
        notes: "Automated RTGS settlement reconciled with bank statement.",
        createdAt: `${raw.paidDate}T11:00:00Z`
      };
    });

  const expenses: ExpenseEntity[] = [
    { id: "EXP-001", orgId: org.id, propertyId: "PROP-001", propertyName: "One BKC (Apex Tower)", expenseCategory: "cam", vendorName: "ISS Facility Services India", invoiceNumber: "ISS-MUM-8821", expenseDate: "2026-08-31", amount: 1100000, gstAmount: 198000, totalAmount: 1298000, paidDate: "2026-09-05", paymentStatus: "paid", description: "Comprehensive housekeeping, mechanical cleaning and facade maintenance", createdAt: "2026-08-31" },
    { id: "EXP-002", orgId: org.id, propertyId: "PROP-001", propertyName: "One BKC (Apex Tower)", expenseCategory: "utility_power", vendorName: "Tata Power Transmission Ltd", invoiceNumber: "TPCL-2026-AUG", expenseDate: "2026-08-31", amount: 480000, gstAmount: 86400, totalAmount: 566400, paidDate: "2026-09-04", paymentStatus: "paid", description: "Common area power grid consumption and transformer surcharge", createdAt: "2026-08-31" },
    { id: "EXP-003", orgId: org.id, propertyId: "PROP-002", propertyName: "Maker Maxity Mumbai", expenseCategory: "property_tax", vendorName: "Brihanmumbai Municipal Corporation (BMC)", invoiceNumber: "BMC-PTAX-Q2-2026", expenseDate: "2026-08-15", amount: 650000, gstAmount: 0, totalAmount: 650000, paidDate: "2026-08-20", paymentStatus: "paid", description: "Q2 Property Assessment Tax for Commercial Block 1 & 2", createdAt: "2026-08-15" },
    { id: "EXP-004", orgId: org.id, propertyId: "PROP-002", propertyName: "Maker Maxity Mumbai", expenseCategory: "repairs_maintenance", vendorName: "Schindler India Elevators", invoiceNumber: "SCH-AMC-2026", expenseDate: "2026-08-25", amount: 280000, gstAmount: 50400, totalAmount: 330400, paidDate: "2026-08-28", paymentStatus: "paid", description: "Quarterly preventative maintenance and safety sensor replacement for 8 high-speed lifts", createdAt: "2026-08-25" },
    { id: "EXP-005", orgId: org.id, propertyId: "PROP-003", propertyName: "Godrej BKC Horizon", expenseCategory: "cam", vendorName: "CBRE Property Management Services", invoiceNumber: "CBRE-PM-092", expenseDate: "2026-08-30", amount: 620000, gstAmount: 111600, totalAmount: 731600, paidDate: "2026-09-02", paymentStatus: "paid", description: "Building engineering, security guards 24/7, and pest control services", createdAt: "2026-08-30" },
    { id: "EXP-006", orgId: org.id, propertyId: "PROP-004", propertyName: "Shivalik Shilp, Ahmedabad", expenseCategory: "utility_power", vendorName: "Torrent Power Limited", invoiceNumber: "TOR-AHM-99120", expenseDate: "2026-08-31", amount: 320000, gstAmount: 57600, totalAmount: 377600, paidDate: "2026-09-05", paymentStatus: "paid", description: "SG Highway corridor grid charges and common area central chiller power", createdAt: "2026-08-31" },
    { id: "EXP-007", orgId: org.id, propertyId: "PROP-005", propertyName: "Business Hub, Pune", expenseCategory: "cam", vendorName: "Knight Frank Facility Management", expenseDate: "2026-08-30", amount: 550000, gstAmount: 99000, totalAmount: 649000, paidDate: "2026-09-03", paymentStatus: "paid", description: "Hinjewadi IT park operations, DG backup fuel and security perimeter patrol", createdAt: "2026-08-30" },
  ];

  const notices: NoticeEntity[] = [
    {
      id: "NTC-001",
      leaseId: "LEASE-009",
      leaseCode: "LSE-2024-009",
      tenantName: "Adani Digital Labs",
      propertyName: "Shivalik Shilp, Ahmedabad",
      noticeDate: "2026-08-15",
      effectiveDate: "2026-11-14",
      noticeReason: "relocation",
      initiatedBy: "tenant",
      remarks: "Tenant relocating digital engineering team to consolidated Adani Corporate Campus.",
      penaltyAmount: 0,
      status: "accepted",
      createdAt: "2026-08-15T11:00:00Z"
    }
  ];

  const alerts: AlertEntity[] = [
    {
      id: "ALT-001",
      orgId: org.id,
      alertType: "invoice_overdue",
      title: "Invoice Overdue: Deloitte Digital",
      message: "Invoice INV-2026-093 for Maker Maxity (₹61,20,660) is overdue by 9 days.",
      entityType: "invoice",
      entityId: "INV-103",
      severity: "critical",
      isRead: false,
      triggerDate: "2026-09-06",
      createdAt: "2026-09-06T00:00:00Z"
    },
    {
      id: "ALT-002",
      orgId: org.id,
      alertType: "expiry_warning",
      title: "Lease Expiring in 5 Months: Wipro Cloud Infra",
      message: "Lease LSE-2023-004 at Godrej BKC Horizon expires on 14-Feb-2027. Initiate renewal negotiations.",
      entityType: "lease",
      entityId: "LEASE-004",
      severity: "warning",
      isRead: false,
      triggerDate: "2026-08-15",
      createdAt: "2026-08-15T00:00:00Z"
    },
    {
      id: "ALT-003",
      orgId: org.id,
      alertType: "escalation_due",
      title: "Escalation Upcoming: Google Enterprise Services",
      message: "5% rent escalation due on 15-Oct-2026 (+₹4,56,000/mo). Escalation notice dispatched.",
      entityType: "lease",
      entityId: "LEASE-002",
      severity: "info",
      isRead: false,
      triggerDate: "2026-09-15",
      createdAt: "2026-09-15T00:00:00Z"
    },
    {
      id: "ALT-004",
      orgId: org.id,
      alertType: "notice_served",
      title: "Vacation Notice: Adani Digital Labs",
      message: "Tenant has served 90-day notice to vacate Suite 401 (Shivalik Shilp). Marketing space for lease.",
      entityType: "lease",
      entityId: "LEASE-009",
      severity: "warning",
      isRead: false,
      triggerDate: "2026-08-15",
      createdAt: "2026-08-15T00:00:00Z"
    }
  ];

  const auditLogs: AuditLogEntity[] = [
    {
      id: "AUD-001",
      leaseId: "LEASE-001",
      entityName: "Escalation",
      action: "APPLY_ESCALATION",
      oldValues: { monthlyRent: 6000000 },
      newValues: { monthlyRent: 6300000, escalationPct: 5 },
      changedBy: "System Automation Engine",
      timestamp: "2026-09-01T00:00:00Z"
    },
    {
      id: "AUD-002",
      entityName: "Collection",
      action: "RECORD_RECEIPT",
      newValues: { receiptNo: "REC-2026-901", amount: 8035800, tenant: "Tata Digital Ltd" },
      changedBy: "Finance Officer",
      timestamp: "2026-09-03T11:20:00Z"
    },
    {
      id: "AUD-003",
      leaseId: "LEASE-009",
      entityName: "LeaseNotice",
      action: "SERVE_NOTICE",
      newValues: { reason: "relocation", effectiveDate: "2026-11-14" },
      changedBy: "Lease Admin",
      timestamp: "2026-08-15T14:30:00Z"
    }
  ];

  return {
    organization: org,
    properties,
    spaces,
    tenants,
    leases,
    escalations,
    invoices,
    collections,
    expenses,
    notices,
    alerts,
    auditLogs,
    config: {
      leaseExpiryAlertDays: 90,
      escalationAlertDays: 30,
      defaultGstPct: 18,
      defaultPaymentDueDays: 15,
      currency: "INR",
      asOfDate: "2026-09-14",
    }
  };
}

function getEmptyRentRollDb(): RentRollDatabase {
  return {
    organization: {
      id: "org-officex-default",
      name: "Commercial Asset Portfolio",
      pan: "",
      gstin: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      fyStartMonth: 4,
      invoicePrefix: "INV-2026",
      currency: "INR",
    },
    properties: [],
    spaces: [],
    tenants: [],
    leases: [],
    escalations: [],
    invoices: [],
    collections: [],
    expenses: [],
    notices: [],
    alerts: [],
    auditLogs: [],
    config: {
      leaseExpiryAlertDays: 90,
      escalationAlertDays: 30,
      defaultGstPct: 18,
      defaultPaymentDueDays: 15,
      currency: "INR",
      asOfDate: new Date().toISOString().split("T")[0],
    }
  };
}

// Read database
export function getRentRollDb(): RentRollDatabase {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getEmptyRentRollDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading rent roll DB, initializing clean DB:", e);
    const initial = getEmptyRentRollDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

// Save database
export function saveRentRollDb(db: RentRollDatabase): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// Log audit entry
export function recordAuditLog(log: Omit<AuditLogEntity, 'id' | 'timestamp'>) {
  const db = getRentRollDb();
  const entry: AuditLogEntity = {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...log,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 500) db.auditLogs.pop();
  saveRentRollDb(db);
}

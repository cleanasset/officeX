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
  round2,
  generateContractRentSteps
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

// Client Accounts (Multi-client operator layer: Owners whose portfolios a subscriber manages)
export interface ClientAccountEntity {
  id: string;
  orgId: string;
  accountCode: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  portalAccessEnabled: boolean;
  status: "active" | "inactive";
}

// Billing Entities (One per SPV / state GSTIN)
export interface BillingEntity {
  id: string;
  orgId: string;
  clientAccountId?: string;
  legalName: string;
  tradeName?: string;
  pan: string;
  gstin: string;
  stateCode: string; // e.g. "27" for Maharashtra
  registeredAddress: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  invoicePrefix: string;
  isDefault: boolean;
}

// Management Mandates (Operator fee rules & collection terms)
export interface ManagementMandateEntity {
  id: string;
  orgId: string;
  clientAccountId: string;
  mandateName: string;
  feeModel: "pct_collections" | "flat_monthly" | "per_sqft";
  feeRate: number;
  settlementType: "direct_to_owner" | "operator_escrow";
  startDate: string;
  endDate?: string;
  status: "active" | "inactive";
}

export interface PropertyEntity {
  id: string;
  orgId: string;
  propertyCode?: string;
  clientAccountId?: string;
  billingEntityId?: string;
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
  operatingCurrency?: string;
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
  spaceType: "office" | "retail" | "food_court" | "warehouse" | "storage" | "flex_desk";
  carpetArea: number;
  chargeableArea: number;
  seatCapacity?: number;
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

// Deals / Pipeline Register (§4.7A, RR-CON-07)
export interface DealEntity {
  id: string;
  orgId: string;
  propertyId: string;
  propertyName?: string;
  prospectName: string;
  industry?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  proposedSpaceId?: string;
  proposedAreaSqft: number;
  proposedSeats?: number;
  targetRentPsf: number;
  targetCommencementDate: string;
  stage: "enquiry" | "qualified" | "viewing" | "proposal_sent" | "term_sheet" | "won" | "lost";
  probabilityPct: number;
  brokerName?: string;
  convertedContractId?: string;
  createdAt: string;
}

// Multi-Charge Lines per Contract (§4.8)
export interface ContractChargeEntity {
  id: string;
  contractId: string;
  chargeType: string; // base_rent, cam, electricity, parking, dg_backup, signage, internet, housekeeping
  billingModel: string; // area, seat, fixed, meter, formula
  rate: number;
  unit: string; // psf_month, per_seat_month, fixed_month, per_kwh
  monthlyAmount: number;
  gstRate: number;
  hsnSacCode: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

// Stepped Escalations (§4.7, RR-ESC-01)
export interface RentStepEntity {
  id: string;
  contractId: string;
  stepNumber: number;
  effectiveDate: string;
  baseRatePsf: number;
  monthlyBaseRent: number;
  escalationPct: number;
  stepType: string; // fixed_pct, cpi_linked, market_review
  status: "scheduled" | "applied" | "skipped" | "disputed";
  appliedAt?: string;
}

// Contract Documents Repository (§4.9)
export interface ContractDocumentEntity {
  id: string;
  contractId: string;
  documentType: string; // term_sheet, loi, agreement, amendment, notice, side_letter
  title: string;
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  status: "draft" | "under_review" | "executed" | "superseded";
  isExecuted: boolean;
  executionDate?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface LeaseEntity {
  id: string;
  orgId: string;
  clientAccountId?: string;
  billingEntityId?: string;
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
  billingModel?: "area" | "seat" | "hybrid" | "fixed" | "charges_only";
  contractType?: string; // commercial_lease, flex_membership, leave_license, head_lease
  isPipeline?: boolean;
  probabilityPct?: number;
  billingDueDay: number;
  gstRate: number;
  tdsRate: number;
  brokerName?: string;
  brokeragePaid: number;
  terminationDate?: string;
  terminationReason?: string;
  signedAgreementUrl?: string;
  notes?: string;
  charges?: ContractChargeEntity[];
  rentSteps?: RentStepEntity[];
  documents?: ContractDocumentEntity[];
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
  billingEntityId?: string;
  clientAccountId?: string;
  billingRunId?: string;
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
  invoiceType?: "rent" | "cam" | "utility" | "consolidated";
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

export interface BillingRunEntity {
  id: string;
  orgId: string;
  billingEntityId?: string;
  periodMonth: string; // "2026-10"
  totalContracts: number;
  totalInvoicesGenerated: number;
  grossBilledAmount: number;
  totalGstAmount: number;
  status: "draft" | "approved" | "issued";
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

export interface PaymentAllocationEntity {
  id: string;
  paymentId: string;
  invoiceId: string;
  allocatedBaseRent: number;
  allocatedCam: number;
  allocatedGst: number;
  allocatedOther: number;
  totalAllocated: number;
  allocatedAt: string;
}

export interface AdjustmentNoteEntity {
  id: string;
  orgId: string;
  invoiceId: string;
  noteType: "credit_note" | "debit_note";
  noteNumber: string;
  reason: string;
  amount: number;
  gstAmount: number;
  totalAdjustment: number;
  issuedDate: string;
  status: "draft" | "applied" | "void";
  createdAt: string;
}

export interface OwnerStatementEntity {
  id: string;
  orgId: string;
  clientAccountId: string;
  clientAccountName?: string;
  statementNumber: string;
  periodMonth: string;
  grossBilled: number;
  totalCollected: number;
  totalArrears: number;
  operatorManagementFee: number;
  reimbursableExpenses: number;
  netRemittanceAmount: number;
  remittanceStatus: "pending" | "remitted" | "acknowledged";
  remittanceDate?: string;
  remittanceUtr?: string;
  issuedAt: string;
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
  postalTrackingNumber?: string;
  createdAt: string;
}

export interface AlertEntity {
  id: string;
  orgId: string;
  propertyId?: string;
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

export interface ImportBatchEntity {
  id: string;
  orgId: string;
  fileName: string;
  billingModel: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  controlTotalArea: number;
  controlTotalRent: number;
  status: "staged" | "validated" | "committed" | "rolled_back";
  committedAt?: string;
  rolledBackAt?: string;
  createdAt: string;
}

export interface MappingTemplateEntity {
  id: string;
  orgId: string;
  templateName: string;
  sourceSystem: string;
  columnMappings: Record<string, string>;
  createdAt: string;
}

export interface RentRollDatabase {
  organization: OrgEntity;
  clientAccounts: ClientAccountEntity[];
  billingEntities: BillingEntity[];
  managementMandates: ManagementMandateEntity[];
  properties: PropertyEntity[];
  spaces: SpaceEntity[];
  tenants: TenantEntity[];
  deals: DealEntity[];
  leases: LeaseEntity[];
  escalations: EscalationEntity[];
  invoices: InvoiceEntity[];
  billingRuns: BillingRunEntity[];
  collections: CollectionEntity[];
  paymentAllocations: PaymentAllocationEntity[];
  adjustmentNotes: AdjustmentNoteEntity[];
  ownerStatements: OwnerStatementEntity[];
  expenses: ExpenseEntity[];
  notices: NoticeEntity[];
  alerts: AlertEntity[];
  auditLogs: AuditLogEntity[];
  importBatches: ImportBatchEntity[];
  mappingTemplates: MappingTemplateEntity[];
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

// Canonical Section 13 Seed Database Builder
export function getInitialSeedDatabase(): RentRollDatabase {
  const org: OrgEntity = {
    id: "org-officex-001",
    name: "Apex Asset Management India Pvt Ltd",
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

  const clientAccounts: ClientAccountEntity[] = [
    {
      id: "CA-SELF",
      orgId: org.id,
      accountCode: "CLI-SELF",
      name: "Apex Institutional Portfolio (Self-Managed)",
      contactPerson: "Aditya Singhal (Managing Director)",
      contactEmail: "aditya@apexrealty.in",
      contactPhone: "+91 98200 11223",
      portalAccessEnabled: true,
      status: "active"
    },
    {
      id: "CA-SHARMA",
      orgId: org.id,
      accountCode: "CLI-SHARMA",
      name: "Sharma Family Office Asset Trust",
      contactPerson: "Vikram Sharma (Trustee)",
      contactEmail: "vikram@sharmatrust.in",
      contactPhone: "+91 98110 33445",
      portalAccessEnabled: true,
      status: "active"
    }
  ];

  const billingEntities: BillingEntity[] = [
    {
      id: "BE-APX-01",
      orgId: org.id,
      clientAccountId: "CA-SELF",
      legalName: "Apex Realty Commercial SPV 1 Pvt Ltd",
      tradeName: "Apex Business Tower",
      pan: "AAFCO1234F",
      gstin: "27AAFCO1234F1Z5",
      stateCode: "27",
      registeredAddress: "Level 14, BKC Apex Tower, Bandra East, Mumbai 400051",
      bankName: "HDFC Bank Ltd",
      bankAccountNumber: "50200088991122",
      bankIfsc: "HDFC0000060",
      bankBranch: "BKC Special Branch",
      invoicePrefix: "APX-INV",
      isDefault: true
    },
    {
      id: "BE-MTP-01",
      orgId: org.id,
      clientAccountId: "CA-SELF",
      legalName: "Meridian Cyber Parks Development LLP",
      tradeName: "Meridian Tech Park",
      pan: "AAFCO5678F",
      gstin: "06AAFCO5678F1Z2",
      stateCode: "06",
      registeredAddress: "DLF Cyber City, Phase 2, Gurugram, Haryana 122002",
      bankName: "ICICI Bank Ltd",
      bankAccountNumber: "000405012345",
      bankIfsc: "ICIC0000004",
      bankBranch: "Cyber City Gurugram",
      invoicePrefix: "MTP-INV",
      isDefault: false
    },
    {
      id: "BE-NXN-01",
      orgId: org.id,
      clientAccountId: "CA-SHARMA",
      legalName: "Nexus Commercial Properties Pvt Ltd",
      tradeName: "Nexus Hub",
      pan: "AAFCO9988F",
      gstin: "09AAFCO9988F1Z4",
      stateCode: "09",
      registeredAddress: "Plot C-12, Sector 62, Noida, Uttar Pradesh 201301",
      bankName: "Axis Bank Ltd",
      bankAccountNumber: "919020033445566",
      bankIfsc: "UTIB0000123",
      bankBranch: "Noida Sector 62",
      invoicePrefix: "NX-INV",
      isDefault: false
    }
  ];

  const managementMandates: ManagementMandateEntity[] = [
    {
      id: "MAN-001",
      orgId: org.id,
      clientAccountId: "CA-SHARMA",
      mandateName: "Sharma Trust Comprehensive Management Agreement",
      feeModel: "pct_collections",
      feeRate: 3.5, // 3.5% of total collections
      settlementType: "direct_to_owner",
      startDate: "2026-04-01",
      endDate: "2031-03-31",
      status: "active"
    }
  ];

  const properties: PropertyEntity[] = [
    {
      id: "PROP-APX",
      orgId: org.id,
      propertyCode: "APX-BKC",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-APX-01",
      name: "Apex Business Tower",
      type: "Commercial IT / BFSI Park",
      address: "Bandra Kurla Complex, Bandra East",
      city: "Mumbai",
      state: "Maharashtra",
      microMarket: "BKC Prime",
      pincode: "400051",
      grade: "A+",
      totalArea: 125000,
      chargeableArea: 125000,
      occupancyTargetPct: 95,
      assetValue: 18500000000, // ₹1,850 Cr
      operatingCurrency: "INR"
    },
    {
      id: "PROP-MTP",
      orgId: org.id,
      propertyCode: "MTP-GGN",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-MTP-01",
      name: "Meridian Tech Park",
      type: "Grade-A IT / SEZ Campus",
      address: "Cyber City, DLF Phase 2",
      city: "Gurugram",
      state: "Haryana",
      microMarket: "Cyber City",
      pincode: "122002",
      grade: "A",
      totalArea: 250000,
      chargeableArea: 250000,
      occupancyTargetPct: 92,
      assetValue: 21000000000, // ₹2,100 Cr
      operatingCurrency: "INR"
    },
    {
      id: "PROP-NXN",
      orgId: org.id,
      propertyCode: "NX-NOI",
      clientAccountId: "CA-SHARMA",
      billingEntityId: "BE-NXN-01",
      name: "Nexus Hub",
      type: "Commercial Office Complex",
      address: "Plot C-12, Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      microMarket: "Sector 62 Institutional",
      pincode: "201301",
      grade: "A",
      totalArea: 180000,
      chargeableArea: 180000,
      occupancyTargetPct: 90,
      assetValue: 9800000000, // ₹980 Cr
      operatingCurrency: "INR"
    },
    {
      id: "PROP-GIFT",
      orgId: org.id,
      propertyCode: "GIFT-IFSC",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-APX-01",
      name: "GIFT Tower One IFSC",
      type: "IFSC FinTech Center",
      address: "GIFT City Corridor, Zone 1",
      city: "Gandhinagar",
      state: "Gujarat",
      microMarket: "GIFT City Special Economic Zone",
      pincode: "382355",
      grade: "A+",
      totalArea: 95000,
      chargeableArea: 95000,
      occupancyTargetPct: 88,
      assetValue: 6500000000, // ₹650 Cr
      operatingCurrency: "INR"
    }
  ];

  const spaces: SpaceEntity[] = [
    { id: "SPC-APX-05A", propertyId: "PROP-APX", buildingName: "Apex Tower", floorNumber: 5, unitNumber: "APX-05A", spaceType: "office", carpetArea: 6800, chargeableArea: 8500, standardRatePsf: 285.20, standardCamPsf: 28, status: "leased", currentLeaseId: "LEASE-APX-01" },
    { id: "SPC-APX-07", propertyId: "PROP-APX", buildingName: "Apex Tower", floorNumber: 7, unitNumber: "APX-07", spaceType: "office", carpetArea: 9600, chargeableArea: 12000, standardRatePsf: 290, standardCamPsf: 28, status: "in_negotiation", currentLeaseId: "LEASE-APX-02" },
    { id: "SPC-APX-08", propertyId: "PROP-APX", buildingName: "Apex Tower", floorNumber: 8, unitNumber: "APX-08", spaceType: "office", carpetArea: 8160, chargeableArea: 10200, standardRatePsf: 275, standardCamPsf: 28, status: "leased", currentLeaseId: "LEASE-APX-03" },
    { id: "SPC-APX-09", propertyId: "PROP-APX", buildingName: "Apex Tower", floorNumber: 9, unitNumber: "APX-09 (Vacant)", spaceType: "office", carpetArea: 8160, chargeableArea: 10200, standardRatePsf: 290, standardCamPsf: 28, status: "available" },
    { id: "SPC-MTP-01", propertyId: "PROP-MTP", buildingName: "Tower 1", floorNumber: 3, unitNumber: "MTP-T1-03", spaceType: "office", carpetArea: 17600, chargeableArea: 22000, standardRatePsf: 95, standardCamPsf: 14, status: "leased", currentLeaseId: "LEASE-MTP-01" },
    { id: "SPC-MTP-02", propertyId: "PROP-MTP", buildingName: "Tower 2", floorNumber: 1, unitNumber: "MTP-T2-01", spaceType: "office", carpetArea: 14800, chargeableArea: 18500, standardRatePsf: 92, standardCamPsf: 14, status: "leased", currentLeaseId: "LEASE-MTP-02" },
    { id: "SPC-NXN-01", propertyId: "PROP-NXN", buildingName: "Block A", floorNumber: 2, unitNumber: "NX-FLEX-01", spaceType: "flex_desk", carpetArea: 12000, chargeableArea: 15000, seatCapacity: 150, standardRatePsf: 85, standardCamPsf: 12, status: "leased", currentLeaseId: "LEASE-NXN-01" },
    { id: "SPC-GIFT-01", propertyId: "PROP-GIFT", buildingName: "IFSC Tower", floorNumber: 10, unitNumber: "GIFT-SUITE-101", spaceType: "office", carpetArea: 3600, chargeableArea: 4500, standardRatePsf: 294, standardCamPsf: 30, status: "leased", currentLeaseId: "LEASE-GIFT-01" }
  ];

  const tenants: TenantEntity[] = [
    {
      id: "TEN-TECHNOVA",
      orgId: org.id,
      tenantCode: "TNT-TN-01",
      tradeName: "TechNova Solutions Pvt Ltd",
      legalName: "TechNova Cloud Solutions India Private Limited",
      industry: "IT / Cloud Services",
      pan: "AABCT1234D",
      gstin: "27AABCT1234D1Z2",
      contactPerson: "Ananya Deshmukh (Head Admin)",
      contactEmail: "ananya.d@technova.com",
      contactPhone: "+91 98201 44552",
      billingAddress: "Suite 501, BKC Apex, Bandra East",
      billingCity: "Mumbai",
      billingState: "Maharashtra",
      billingPincode: "400051",
      status: "active",
      creditLimit: 50000000,
      paymentTermsDays: 15,
      createdAt: "2023-04-01"
    },
    {
      id: "TEN-GLOBALLOG",
      orgId: org.id,
      tenantCode: "TNT-GL-02",
      tradeName: "Global Logistics India Ltd",
      legalName: "Global Logistics Corporation India Limited",
      industry: "Supply Chain & Logistics",
      pan: "AABCG5678E",
      gstin: "27AABCG5678E1Z9",
      contactPerson: "Suresh Menon (VP Real Estate)",
      contactEmail: "suresh.menon@globallogistics.in",
      contactPhone: "+91 98110 88771",
      billingAddress: "Logistics House, Nariman Point",
      billingCity: "Mumbai",
      billingState: "Maharashtra",
      billingPincode: "400021",
      status: "prospect",
      creditLimit: 100000000,
      paymentTermsDays: 15,
      createdAt: "2026-08-15"
    },
    {
      id: "TEN-APEXFIN",
      orgId: org.id,
      tenantCode: "TNT-AF-03",
      tradeName: "Apex Financial Advisors LLP",
      legalName: "Apex Financial Advisory Services LLP",
      industry: "BFSI / Private Wealth",
      pan: "AACFA9988K",
      gstin: "27AACFA9988K1Z3",
      contactPerson: "Karan Johar (Managing Partner)",
      contactEmail: "karan@apexadvisors.in",
      contactPhone: "+91 98332 11223",
      billingAddress: "Floor 8, BKC Apex, Bandra East",
      billingCity: "Mumbai",
      billingState: "Maharashtra",
      billingPincode: "400051",
      status: "active",
      creditLimit: 40000000,
      paymentTermsDays: 15,
      createdAt: "2021-07-15"
    },
    {
      id: "TEN-INNOVATE",
      orgId: org.id,
      tenantCode: "TNT-IC-04",
      tradeName: "Innovate Corp Technologies Pvt Ltd",
      legalName: "Innovate Corp Technologies Private Limited",
      industry: "Software & AI Solutions",
      pan: "AAACI1122L",
      gstin: "06AAACI1122L1Z8",
      contactPerson: "Pooja Malhotra (VP Facilities)",
      contactEmail: "pooja.m@innovatecorp.com",
      contactPhone: "+91 99203 77884",
      billingAddress: "Tower 1, Meridian Tech Park, Cyber City",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122002",
      status: "active",
      creditLimit: 60000000,
      paymentTermsDays: 15,
      createdAt: "2023-11-01"
    },
    {
      id: "TEN-CLOUDSCALE",
      orgId: org.id,
      tenantCode: "TNT-CS-05",
      tradeName: "CloudScale Systems India",
      legalName: "CloudScale Systems India Pvt Ltd",
      industry: "Cloud & Devops",
      pan: "AABCC4455N",
      gstin: "06AABCC4455N1Z5",
      contactPerson: "Rohan Varma (Operations Lead)",
      contactEmail: "rohan@cloudscale.io",
      contactPhone: "+91 98500 33441",
      billingAddress: "Tower 2, Meridian Tech Park",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122002",
      status: "active",
      creditLimit: 30000000,
      paymentTermsDays: 15,
      createdAt: "2024-02-01"
    },
    {
      id: "TEN-QUANTUM",
      orgId: org.id,
      tenantCode: "TNT-QW-06",
      tradeName: "Quantum Workspace Enterprise Members",
      legalName: "Quantum Flex Co-Working Solutions LLP",
      industry: "Flex Office & Co-Working",
      pan: "AACFQ7788R",
      gstin: "09AACFQ7788R1Z1",
      contactPerson: "Divya Kapoor (Community Director)",
      contactEmail: "divya@quantumwork.in",
      contactPhone: "+91 98200 99887",
      billingAddress: "Sector 62 Nexus Hub",
      billingCity: "Noida",
      billingState: "Uttar Pradesh",
      billingPincode: "201301",
      status: "active",
      creditLimit: 25000000,
      paymentTermsDays: 10,
      createdAt: "2024-05-01"
    }
  ];

  const deals: DealEntity[] = [
    {
      id: "DEAL-001",
      orgId: org.id,
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      prospectName: "Global Logistics India Ltd",
      industry: "Supply Chain & Logistics",
      contactPerson: "Suresh Menon",
      contactEmail: "suresh.menon@globallogistics.in",
      contactPhone: "+91 98110 88771",
      proposedSpaceId: "SPC-APX-07",
      proposedAreaSqft: 12000,
      targetRentPsf: 290,
      targetCommencementDate: "2027-01-01",
      stage: "term_sheet",
      probabilityPct: 60,
      brokerName: "CBRE Commercial Advisory",
      createdAt: "2026-08-15"
    }
  ];

  // Raw Leases based on Section 13 Fixtures
  const rawLeases: Array<any> = [
    {
      id: "LEASE-APX-01",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-APX-01",
      propertyId: "PROP-APX",
      spaceId: "SPC-APX-05A",
      unitNumber: "APX-05A",
      floorNumber: 5,
      tenantId: "TEN-TECHNOVA",
      leaseCode: "APX-L-0042",
      startDate: "2023-04-01",
      endDate: "2032-03-31",
      lockInEndDate: "2026-03-31",
      noticePeriodDays: 90,
      chargeableArea: 8500,
      carpetArea: 6800,
      baseRentPsf: 285.20,
      monthlyRent: 2424200,
      camRatePsf: 28,
      camMonthly: 238000,
      utilityFixedMonthly: 35000,
      parkingChargesMonthly: 40000,
      signageChargesMonthly: 15000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 14545200,
      escalationPct: 15,
      escalationFrequencyMonths: 36,
      nextEscalationDate: "2026-04-01",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "active"
    },
    {
      id: "LEASE-APX-02",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-APX-01",
      propertyId: "PROP-APX",
      spaceId: "SPC-APX-07",
      unitNumber: "APX-07",
      floorNumber: 7,
      tenantId: "TEN-GLOBALLOG",
      leaseCode: "APX-L-0043-PIP",
      startDate: "2027-01-01",
      endDate: "2035-12-31",
      lockInEndDate: "2029-12-31",
      noticePeriodDays: 90,
      chargeableArea: 12000,
      carpetArea: 9600,
      baseRentPsf: 290,
      monthlyRent: 3480000,
      camRatePsf: 28,
      camMonthly: 336000,
      utilityFixedMonthly: 40000,
      parkingChargesMonthly: 50000,
      signageChargesMonthly: 20000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 0,
      escalationPct: 15,
      escalationFrequencyMonths: 36,
      nextEscalationDate: "2030-01-01",
      billingModel: "area",
      contractType: "commercial_lease",
      isPipeline: true,
      probabilityPct: 60,
      status: "draft"
    },
    {
      id: "LEASE-APX-03",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-APX-01",
      propertyId: "PROP-APX",
      spaceId: "SPC-APX-08",
      unitNumber: "APX-08",
      floorNumber: 8,
      tenantId: "TEN-APEXFIN",
      leaseCode: "APX-L-0038",
      startDate: "2021-07-15",
      endDate: "2027-07-14",
      lockInEndDate: "2024-07-14",
      noticePeriodDays: 90,
      chargeableArea: 10200,
      carpetArea: 8160,
      baseRentPsf: 275,
      monthlyRent: 2805000,
      camRatePsf: 28,
      camMonthly: 285600,
      utilityFixedMonthly: 30000,
      parkingChargesMonthly: 45000,
      signageChargesMonthly: 15000,
      otherChargesMonthly: 0,
      securityDepositMonths: 10,
      securityDepositPaid: 28050000,
      escalationPct: 5,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-07-15",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "active"
    },
    {
      id: "LEASE-MTP-01",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-MTP-01",
      propertyId: "PROP-MTP",
      spaceId: "SPC-MTP-01",
      unitNumber: "MTP-T1-03",
      floorNumber: 3,
      tenantId: "TEN-INNOVATE",
      leaseCode: "MTP-L-0105",
      startDate: "2023-11-01",
      endDate: "2032-10-31",
      lockInEndDate: "2026-10-31",
      noticePeriodDays: 90,
      chargeableArea: 22000,
      carpetArea: 17600,
      baseRentPsf: 95,
      monthlyRent: 2090000,
      camRatePsf: 14,
      camMonthly: 308000,
      utilityFixedMonthly: 45000,
      parkingChargesMonthly: 60000,
      signageChargesMonthly: 20000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 12540000,
      escalationPct: 15,
      escalationFrequencyMonths: 36,
      nextEscalationDate: "2026-11-01",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "active"
    },
    {
      id: "LEASE-MTP-02",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-MTP-01",
      propertyId: "PROP-MTP",
      spaceId: "SPC-MTP-02",
      unitNumber: "MTP-T2-01",
      floorNumber: 1,
      tenantId: "TEN-CLOUDSCALE",
      leaseCode: "MTP-L-0108",
      startDate: "2024-02-01",
      endDate: "2033-01-31",
      lockInEndDate: "2027-01-31",
      noticePeriodDays: 90,
      chargeableArea: 18500,
      carpetArea: 14800,
      baseRentPsf: 92,
      monthlyRent: 1702000,
      camRatePsf: 14,
      camMonthly: 259000,
      utilityFixedMonthly: 35000,
      parkingChargesMonthly: 50000,
      signageChargesMonthly: 15000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 10212000,
      escalationPct: 5,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-02-01",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "active"
    },
    {
      id: "LEASE-NXN-01",
      clientAccountId: "CA-SHARMA",
      billingEntityId: "BE-NXN-01",
      propertyId: "PROP-NXN",
      spaceId: "SPC-NXN-01",
      unitNumber: "NX-FLEX-01",
      floorNumber: 2,
      tenantId: "TEN-QUANTUM",
      leaseCode: "NX-FLX-0012",
      startDate: "2024-05-01",
      endDate: "2027-04-30",
      lockInEndDate: "2025-04-30",
      noticePeriodDays: 60,
      chargeableArea: 15000,
      carpetArea: 12000,
      baseRentPsf: 85,
      monthlyRent: 1275000,
      camRatePsf: 0,
      camMonthly: 0,
      utilityFixedMonthly: 20000,
      parkingChargesMonthly: 30000,
      signageChargesMonthly: 10000,
      otherChargesMonthly: 0,
      securityDepositMonths: 2,
      securityDepositPaid: 2550000,
      escalationPct: 10,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-05-01",
      billingModel: "seat",
      contractType: "flex_membership",
      status: "active"
    }
  ];

  const leases: LeaseEntity[] = rawLeases.map(rl => {
    const prop = properties.find(p => p.id === rl.propertyId);
    const tnt = tenants.find(t => t.id === rl.tenantId);
    const summary = computeFullLeaseSummary(rl);

    const charges: ContractChargeEntity[] = [
      {
        id: `CHG-${rl.id}-01`,
        contractId: rl.id,
        chargeType: "base_rent",
        billingModel: rl.billingModel || "area",
        rate: rl.baseRentPsf,
        unit: "psf_month",
        monthlyAmount: rl.monthlyRent,
        gstRate: 18,
        hsnSacCode: "997212",
        effectiveFrom: rl.startDate
      },
      {
        id: `CHG-${rl.id}-02`,
        contractId: rl.id,
        chargeType: "cam",
        billingModel: "area",
        rate: rl.camRatePsf,
        unit: "psf_month",
        monthlyAmount: rl.camMonthly,
        gstRate: 18,
        hsnSacCode: "997212",
        effectiveFrom: rl.startDate
      }
    ];

    const rentSteps: RentStepEntity[] = generateContractRentSteps(
      rl.startDate,
      rl.endDate,
      rl.baseRentPsf,
      rl.chargeableArea,
      rl.escalationPct,
      rl.escalationFrequencyMonths
    ).map(cs => ({
      id: `STEP-${rl.id}-${cs.stepNumber}`,
      contractId: rl.id,
      stepNumber: cs.stepNumber,
      effectiveDate: cs.effectiveDate,
      baseRatePsf: cs.baseRatePsf,
      monthlyBaseRent: cs.monthlyBaseRent,
      escalationPct: cs.escalationPct,
      stepType: "fixed_pct",
      status: cs.status
    }));

    const documents: ContractDocumentEntity[] = [
      {
        id: `DOC-${rl.id}-01`,
        contractId: rl.id,
        documentType: "agreement",
        title: `Registered Commercial Lease Deed - ${rl.unitNumber}`,
        versionNumber: 1,
        fileUrl: "/documents/sample_lease_deed.pdf",
        fileName: `${rl.leaseCode}_Lease_Deed_Executed.pdf`,
        fileSizeBytes: 2450000,
        status: "executed",
        isExecuted: true,
        executionDate: rl.startDate,
        createdAt: rl.startDate
      }
    ];

    return {
      id: rl.id,
      orgId: org.id,
      clientAccountId: rl.clientAccountId,
      billingEntityId: rl.billingEntityId,
      propertyId: rl.propertyId,
      propertyName: prop?.name || "Apex Business Tower",
      spaceId: rl.spaceId,
      unitNumber: rl.unitNumber,
      floorNumber: rl.floorNumber,
      tenantId: rl.tenantId,
      tenantName: tnt?.tradeName || rl.tenantId,
      leaseCode: rl.leaseCode,
      startDate: rl.startDate,
      endDate: rl.endDate,
      fitoutPeriodDays: 0,
      rentFreePeriodDays: 0,
      carpetArea: rl.carpetArea,
      chargeableArea: rl.chargeableArea,
      monthlyRent: rl.monthlyRent,
      baseRentPsf: rl.baseRentPsf,
      camRatePsf: rl.camRatePsf,
      camMonthly: rl.camMonthly,
      utilityFixedMonthly: rl.utilityFixedMonthly,
      parkingChargesMonthly: rl.parkingChargesMonthly,
      signageChargesMonthly: rl.signageChargesMonthly,
      otherChargesMonthly: rl.otherChargesMonthly,
      totalMonthlyGross: summary.totalMonthlyGross,
      annualRentGross: summary.annualRentGross,
      securityDepositMonths: rl.securityDepositMonths,
      securityDepositAmount: summary.securityDepositRequired,
      securityDepositPaid: rl.securityDepositPaid,
      escalationPct: rl.escalationPct,
      escalationFrequencyMonths: rl.escalationFrequencyMonths,
      nextEscalationDate: rl.nextEscalationDate || (summary.nextEscalationDate instanceof Date ? summary.nextEscalationDate.toISOString().split("T")[0] : String(summary.nextEscalationDate)),
      lockInMonths: rl.lockInEndDate ? 36 : 12,
      lockInEndDate: rl.lockInEndDate || (summary.lockInEndDate instanceof Date ? summary.lockInEndDate.toISOString().split("T")[0] : "2029-03-31"),
      noticePeriodDays: rl.noticePeriodDays,
      status: rl.status,
      renewalStatus: summary.daysToExpiry < 365 ? "approaching" : "not_due",
      billingFrequency: "monthly",
      billingModel: rl.billingModel || "area",
      contractType: rl.contractType || "commercial_lease",
      isPipeline: rl.isPipeline,
      probabilityPct: rl.probabilityPct,
      billingDueDay: 5,
      gstRate: 18,
      tdsRate: 10,
      brokeragePaid: round2(rl.monthlyRent * 1.5),
      signedAgreementUrl: "/documents/sample_lease_deed.pdf",
      charges,
      rentSteps,
      documents,
      createdAt: rl.startDate,
      updatedAt: rl.startDate
    };
  });

  const escalations: EscalationEntity[] = [
    {
      id: "ESC-001",
      leaseId: "LEASE-MTP-01",
      leaseCode: "MTP-L-0105",
      tenantName: "Innovate Corp Technologies Pvt Ltd",
      propertyName: "Meridian Tech Park",
      escalationDate: "2026-11-01",
      previousRent: 2090000,
      newRent: 2403500,
      escalationPct: 15,
      calculatedIncrease: 313500,
      status: "pending",
      notes: "15% stepped escalation due on 01-Nov-2026 per registered clause 4.2."
    },
    {
      id: "ESC-002",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      tenantName: "TechNova Solutions Pvt Ltd",
      propertyName: "Apex Business Tower",
      escalationDate: "2026-04-01",
      previousRent: 2108000,
      newRent: 2424200,
      escalationPct: 15,
      calculatedIncrease: 316200,
      status: "applied",
      appliedAt: "2026-04-01T00:00:00Z",
      appliedBy: "System Automation",
      notes: "Applied 3-year escalation step."
    }
  ];

  const invoices: InvoiceEntity[] = [
    {
      id: "INV-2026-901",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      tenantId: "TEN-TECHNOVA",
      tenantName: "TechNova Solutions Pvt Ltd",
      invoiceNumber: "APX-INV-2026-0901",
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-15",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      invoiceType: "consolidated",
      baseRent: 2424200,
      camCharges: 238000,
      utilityCharges: 35000,
      otherCharges: 55000,
      subtotal: 2752200,
      gstRate: 18,
      gstAmount: 495396,
      grossTotal: 3247596,
      tdsDeducted: 242420,
      netPayable: 3005176,
      amountPaid: 3005176,
      balanceDue: 0,
      status: "paid",
      paidDate: "2026-09-04",
      paymentMode: "neft_rtgs",
      referenceNumber: "HDFCR520260904123456",
      createdAt: "2026-09-01T08:00:00Z"
    },
    {
      id: "INV-2026-902",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-APX-03",
      leaseCode: "APX-L-0038",
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      tenantId: "TEN-APEXFIN",
      tenantName: "Apex Financial Advisors LLP",
      invoiceNumber: "APX-INV-2026-0902",
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-15",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      invoiceType: "consolidated",
      baseRent: 2805000,
      camCharges: 285600,
      utilityCharges: 30000,
      otherCharges: 60000,
      subtotal: 3180600,
      gstRate: 18,
      gstAmount: 572508,
      grossTotal: 3753108,
      tdsDeducted: 280500,
      netPayable: 3472608,
      amountPaid: 0,
      balanceDue: 3472608,
      status: "overdue",
      createdAt: "2026-09-01T08:00:00Z"
    },
    {
      id: "INV-2026-903",
      orgId: org.id,
      billingEntityId: "BE-MTP-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-MTP-01",
      leaseCode: "MTP-L-0105",
      propertyId: "PROP-MTP",
      propertyName: "Meridian Tech Park",
      tenantId: "TEN-INNOVATE",
      tenantName: "Innovate Corp Technologies Pvt Ltd",
      invoiceNumber: "MTP-INV-2026-0903",
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-15",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      invoiceType: "consolidated",
      baseRent: 2090000,
      camCharges: 308000,
      utilityCharges: 45000,
      otherCharges: 80000,
      subtotal: 2523000,
      gstRate: 18,
      gstAmount: 454140,
      grossTotal: 2977140,
      tdsDeducted: 209000,
      netPayable: 2768140,
      amountPaid: 2768140,
      balanceDue: 0,
      status: "paid",
      paidDate: "2026-09-08",
      paymentMode: "neft_rtgs",
      referenceNumber: "ICICR520260908889900",
      createdAt: "2026-09-01T08:00:00Z"
    }
  ];

  const billingRuns: BillingRunEntity[] = [
    {
      id: "RUN-2026-09",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      periodMonth: "2026-09",
      totalContracts: 5,
      totalInvoicesGenerated: 3,
      grossBilledAmount: 9977844,
      totalGstAmount: 1522044,
      status: "issued",
      createdAt: "2026-09-01T08:00:00Z"
    }
  ];

  const collections: CollectionEntity[] = [
    {
      id: "COL-2026-001",
      orgId: org.id,
      invoiceId: "INV-2026-901",
      invoiceNumber: "APX-INV-2026-0901",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      tenantId: "TEN-TECHNOVA",
      tenantName: "TechNova Solutions Pvt Ltd",
      propertyName: "Apex Business Tower",
      receiptNumber: "REC-APX-2026-001",
      paymentDate: "2026-09-04",
      paymentMode: "neft_rtgs",
      referenceNumber: "HDFCR520260904123456",
      amountReceived: 3005176,
      tdsDeducted: 242420,
      bankCharges: 0,
      netCredited: 3005176,
      bankAccount: "HDFC BKC 50200088991122",
      notes: "Full settlement for Sept 2026 invoice.",
      createdAt: "2026-09-04T10:30:00Z"
    },
    {
      id: "COL-2026-002",
      orgId: org.id,
      invoiceId: "INV-2026-903",
      invoiceNumber: "MTP-INV-2026-0903",
      leaseId: "LEASE-MTP-01",
      leaseCode: "MTP-L-0105",
      tenantId: "TEN-INNOVATE",
      tenantName: "Innovate Corp Technologies Pvt Ltd",
      propertyName: "Meridian Tech Park",
      receiptNumber: "REC-MTP-2026-002",
      paymentDate: "2026-09-08",
      paymentMode: "neft_rtgs",
      referenceNumber: "ICICR520260908889900",
      amountReceived: 2768140,
      tdsDeducted: 209000,
      bankCharges: 0,
      netCredited: 2768140,
      bankAccount: "ICICI Cyber City 000405012345",
      notes: "Full settlement via RTGS.",
      createdAt: "2026-09-08T14:15:00Z"
    }
  ];

  const paymentAllocations: PaymentAllocationEntity[] = [
    {
      id: "ALLOC-001",
      paymentId: "COL-2026-001",
      invoiceId: "INV-2026-901",
      allocatedGst: 495396,
      allocatedBaseRent: 2181780,
      allocatedCam: 238000,
      allocatedOther: 90000,
      totalAllocated: 3005176,
      allocatedAt: "2026-09-04T10:30:00Z"
    },
    {
      id: "ALLOC-002",
      paymentId: "COL-2026-002",
      invoiceId: "INV-2026-903",
      allocatedGst: 454140,
      allocatedBaseRent: 1881000,
      allocatedCam: 308000,
      allocatedOther: 125000,
      totalAllocated: 2768140,
      allocatedAt: "2026-09-08T14:15:00Z"
    }
  ];

  const adjustmentNotes: AdjustmentNoteEntity[] = [
    {
      id: "ADJ-001",
      orgId: org.id,
      invoiceId: "INV-2026-902",
      noteType: "credit_note",
      noteNumber: "CN-2026-001",
      reason: "cam_reconciliation",
      amount: 50000,
      gstAmount: 9000,
      totalAdjustment: 59000,
      issuedDate: "2026-09-10",
      status: "applied",
      createdAt: "2026-09-10T12:00:00Z"
    }
  ];

  const ownerStatements: OwnerStatementEntity[] = [
    {
      id: "STMT-2026-08",
      orgId: org.id,
      clientAccountId: "CA-SHARMA",
      clientAccountName: "Sharma Family Office Asset Trust",
      statementNumber: "STMT-SHARMA-2026-08",
      periodMonth: "2026-08",
      grossBilled: 1534000,
      totalCollected: 1534000,
      totalArrears: 0,
      operatorManagementFee: 53690, // 3.5%
      reimbursableExpenses: 12500,
      netRemittanceAmount: 1467810,
      remittanceStatus: "remitted",
      remittanceDate: "2026-09-05",
      remittanceUtr: "AXISR520260905998877",
      issuedAt: "2026-09-02T10:00:00Z"
    }
  ];

  const expenses: ExpenseEntity[] = [
    {
      id: "EXP-001",
      orgId: org.id,
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      expenseCategory: "cam",
      vendorName: "ISS Integrated Facility Services",
      invoiceNumber: "ISS-MUM-4451",
      expenseDate: "2026-08-31",
      amount: 480000,
      gstAmount: 86400,
      totalAmount: 566400,
      paidDate: "2026-09-05",
      paymentStatus: "paid",
      description: "August 2026 Comprehensive Housekeeping & MEP Operations",
      createdAt: "2026-09-01T00:00:00Z"
    },
    {
      id: "EXP-002",
      orgId: org.id,
      propertyId: "PROP-MTP",
      propertyName: "Meridian Tech Park",
      expenseCategory: "utility_power",
      vendorName: "DHBVN Power Distribution",
      invoiceNumber: "DHBVN-2026-08-99",
      expenseDate: "2026-08-25",
      amount: 620000,
      gstAmount: 0,
      totalAmount: 620000,
      paidDate: "2026-09-02",
      paymentStatus: "paid",
      description: "HT Commercial Substation Power Charges",
      createdAt: "2026-09-01T00:00:00Z"
    }
  ];

  const notices: NoticeEntity[] = [
    {
      id: "NOT-001",
      leaseId: "LEASE-APX-03",
      leaseCode: "APX-L-0038",
      tenantName: "Apex Financial Advisors LLP",
      propertyName: "Apex Business Tower",
      noticeDate: "2026-09-20",
      effectiveDate: "2026-10-05",
      noticeReason: "dispute",
      initiatedBy: "landlord",
      remarks: "Section 106 Statutory Demand Notice served for overdue arrears exceeding 15 days.",
      penaltyAmount: 50000,
      status: "pending",
      postalTrackingNumber: "ED928174920IN",
      createdAt: "2026-09-20T11:00:00Z"
    }
  ];

  const alerts: AlertEntity[] = [
    {
      id: "ALT-001",
      orgId: org.id,
      alertType: "invoice_overdue",
      title: "Arrears Alert: Apex Financial Advisors LLP",
      message: "Invoice APX-INV-2026-0902 (₹34,72,608) is overdue. Statutory notice served.",
      entityType: "invoice",
      entityId: "INV-2026-902",
      severity: "critical",
      isRead: false,
      triggerDate: "2026-09-16",
      createdAt: "2026-09-16T00:00:00Z"
    },
    {
      id: "ALT-002",
      orgId: org.id,
      alertType: "escalation_due",
      title: "Upcoming 15% Escalation: Innovate Corp Technologies",
      message: "15% stepped escalation due on 01-Nov-2026 (+₹3,13,500/mo). Notice sent.",
      entityType: "lease",
      entityId: "LEASE-MTP-01",
      severity: "info",
      isRead: false,
      triggerDate: "2026-09-20",
      createdAt: "2026-09-20T00:00:00Z"
    },
    {
      id: "ALT-003",
      orgId: org.id,
      alertType: "expiry_approaching",
      title: "Lease Expiry < 12 Months: Apex Financial Advisors",
      message: "Lease expires 14-Jul-2027. Renewal discussion stage recommended.",
      entityType: "lease",
      entityId: "LEASE-APX-03",
      severity: "warning",
      isRead: false,
      triggerDate: "2026-09-01",
      createdAt: "2026-09-01T00:00:00Z"
    }
  ];

  const auditLogs: AuditLogEntity[] = [
    {
      id: "AUD-001",
      leaseId: "LEASE-APX-01",
      entityName: "Escalation",
      action: "APPLY_ESCALATION",
      oldValues: { monthlyRent: 2108000 },
      newValues: { monthlyRent: 2424200, escalationPct: 15 },
      changedBy: "System Automation Engine",
      timestamp: "2026-04-01T00:00:00Z"
    },
    {
      id: "AUD-002",
      entityName: "Collection",
      action: "RECORD_RECEIPT",
      newValues: { receiptNo: "REC-APX-2026-001", amount: 3005176, tenant: "TechNova Solutions Pvt Ltd" },
      changedBy: "Finance Officer",
      timestamp: "2026-09-04T10:30:00Z"
    }
  ];

  const importBatches: ImportBatchEntity[] = [];
  const mappingTemplates: MappingTemplateEntity[] = [
    {
      id: "TPL-STD-01",
      orgId: org.id,
      templateName: "OfficeX Standard 16-Column Commercial Template",
      sourceSystem: "Excel_Standard",
      columnMappings: {
        "tenanttradename": "tenantName",
        "chargeableareasqft": "chargeableArea",
        "monthlybaserentinr": "monthlyRent",
        "camratepsf": "camRatePsf",
        "startdate": "startDate",
        "enddate": "endDate",
        "escalationpct": "escalationPct"
      },
      createdAt: "2026-09-01T00:00:00Z"
    }
  ];

  return {
    organization: org,
    clientAccounts,
    billingEntities,
    managementMandates,
    properties,
    spaces,
    tenants,
    deals,
    leases,
    escalations,
    invoices,
    billingRuns,
    collections,
    paymentAllocations,
    adjustmentNotes,
    ownerStatements,
    expenses,
    notices,
    alerts,
    auditLogs,
    importBatches,
    mappingTemplates,
    config: {
      leaseExpiryAlertDays: 90,
      escalationAlertDays: 30,
      defaultGstPct: 18,
      defaultPaymentDueDays: 15,
      currency: "INR",
      asOfDate: "2026-09-25",
    }
  };
}

export function getEmptyRentRollDb(): RentRollDatabase {
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
    clientAccounts: [],
    billingEntities: [],
    managementMandates: [],
    properties: [],
    spaces: [],
    tenants: [],
    deals: [],
    leases: [],
    escalations: [],
    invoices: [],
    billingRuns: [],
    collections: [],
    paymentAllocations: [],
    adjustmentNotes: [],
    ownerStatements: [],
    expenses: [],
    notices: [],
    alerts: [],
    auditLogs: [],
    importBatches: [],
    mappingTemplates: [],
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
    const initial = getInitialSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    
    // Ensure all canonical arrays exist
    if (!parsed.clientAccounts) parsed.clientAccounts = [];
    if (!parsed.billingEntities) parsed.billingEntities = [];
    if (!parsed.managementMandates) parsed.managementMandates = [];
    if (!parsed.deals) parsed.deals = [];
    if (!parsed.billingRuns) parsed.billingRuns = [];
    if (!parsed.paymentAllocations) parsed.paymentAllocations = [];
    if (!parsed.adjustmentNotes) parsed.adjustmentNotes = [];
    if (!parsed.ownerStatements) parsed.ownerStatements = [];
    if (!parsed.importBatches) parsed.importBatches = [];
    if (!parsed.mappingTemplates) parsed.mappingTemplates = [];

    // If properties empty or has old placeholder data, populate Section 13 fixtures
    if (!parsed.properties || parsed.properties.length === 0) {
      const initial = getInitialSeedDatabase();
      parsed.clientAccounts = initial.clientAccounts;
      parsed.billingEntities = initial.billingEntities;
      parsed.managementMandates = initial.managementMandates;
      parsed.properties = initial.properties;
      parsed.spaces = initial.spaces;
      parsed.tenants = initial.tenants;
      parsed.deals = initial.deals;
      parsed.leases = initial.leases;
      parsed.escalations = initial.escalations;
      parsed.invoices = initial.invoices;
      parsed.collections = initial.collections;
      parsed.paymentAllocations = initial.paymentAllocations;
      parsed.adjustmentNotes = initial.adjustmentNotes;
      parsed.ownerStatements = initial.ownerStatements;
      parsed.expenses = initial.expenses;
      parsed.notices = initial.notices;
      parsed.alerts = initial.alerts;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    }

    return parsed;
  } catch (e) {
    console.error("Error reading rent roll DB, initializing clean DB with Section 13 fixtures:", e);
    const initial = getInitialSeedDatabase();
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

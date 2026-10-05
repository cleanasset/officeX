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
import { persistDbToCloud, fetchDbFromCloud } from './cloud-db-sync';

export interface OrgEntity {
  id: string;
  name: string;
  tradeName?: string;
  pan: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  fyStartMonth: number;
  invoicePrefix: string;
  currency: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  accountType?: string;
  escrowNodalVerified?: boolean;
  upiVpa?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
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
  upiVpa?: string;
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

export function isClientMandateActive(clientAccountId: string, asOfDate?: string): boolean {
  if (!clientAccountId || clientAccountId === "CA-SELF") return true;
  const db = getRentRollDb();
  const today = asOfDate || new Date().toISOString().split("T")[0];
  const mandate = (db.managementMandates || []).find(m => m.clientAccountId === clientAccountId);
  if (!mandate) return true;
  if (mandate.status === "inactive") return false;
  if (mandate.endDate && mandate.endDate < today) return false;
  return true;
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
  carpetArea?: number;
  occupancyTargetPct: number;
  imageUrl?: string;
  assetValue?: number; // for Cap Rate calculation
  operatingCurrency?: string;
  areaUnit?: "sqft" | "sqm";
  geoLat?: string;
  geoLng?: string;
  status?: "operational" | "under_fitout" | "under_construction" | "under_refurbishment" | "disposed" | string;
  entityType?: "pvt_ltd" | "public_ltd" | "llp" | "proprietorship" | "partnership" | "individual" | "trust_reit" | string;
  cinNumber?: string;
  llpinNumber?: string;
  panNumber?: string;
  gstin?: string;
  towers?: any[];
  units?: any[];
  compliance?: any;
  ownerEmail?: string;
  ownerUserId?: string;
  ownerName?: string;
  ownerCompany?: string;
  sourceSystem?: string;
  version?: number;
  dataQualityStatus?: string;
}

export interface SpaceEntity {
  id: string;
  propertyId: string;
  spaceCode?: string;
  buildingName: string;
  floorNumber: number;
  unitNumber: string;
  spaceType: "office" | "retail" | "food_court" | "warehouse" | "storage" | "flex_desk" | "flex_floor" | "parking_block" | "terrace" | "antenna_site" | "cabin" | "meeting_room" | "other";
  carpetArea: number;
  chargeableArea: number;
  seatCapacity?: number;
  standardRatePsf: number;
  standardCamPsf: number;
  standardMarketRentPsf?: number;
  potentialMonthlyRent?: number;
  daysVacant?: number;
  marketAvailableDate?: string;
  targetTenantProfile?: string;
  status: "available" | "leased" | "in_negotiation" | "under_fitout" | "vacant" | "occupied" | "reserved" | "not_leasable";
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
  status: "active" | "inactive" | "prospect" | "blacklisted" | "invited";
  portalLive?: boolean;
  inviteCode?: string;
  inviteStatus?: string;
  propertyId?: string;
  propertyName?: string;
  unitNumber?: string;
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
  isCurrent?: boolean;
  executionDate?: string;
  uploadedBy?: string;
  createdAt: string;
  name?: string;
  type?: string;
  uploadedAt?: string;
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
  status: "draft" | "pending_approval" | "active" | "under_notice" | "expired" | "terminated" | "holdover";
  renewalStatus: "not_due" | "approaching" | "under_negotiation" | "renewed" | "vacating";
  direction?: "receivable" | "payable";
  contractType?: "lease_deed" | "leave_and_licence" | "managed_office_agreement" | "coworking_membership" | "head_lease" | "sublease" | "revenue_share" | string;
  approvalStatus?: "draft" | "submitted" | "approved" | "rejected" | "active";
  approvedBy?: string;
  approvedAt?: string;
  approvalRemarks?: string;
  billingFrequency: "monthly" | "quarterly" | "annual";
  billingModel?: "area" | "seat" | "hybrid" | "fixed" | "revenue_share" | "charges_only" | "usage" | "bundled";
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
  rentAgreementFileName?: string;
  isTermsPending?: boolean;
  hasPendingDocument?: boolean;
  agreementDocumentPending?: boolean;
  notes?: string;
  makerId?: string;
  createdBy?: string;
  currency?: string;
  fxRate?: number;
  monthlyRentUsd?: number;
  spacesCovered?: Array<{ spaceId: string; unitNumber: string; areaSqft: number; floorNumber: number }>;
  concessions?: Array<{ id: string; type: "rent_free" | "fitout_contribution" | "tenant_improvement"; value: number; unit: "days" | "inr"; startDate?: string; endDate?: string; remarks?: string }>;
  depositTransactions?: Array<{ id: string; type: "received" | "top_up" | "refund" | "deduction" | "bank_guarantee"; amount: number; transactionDate: string; refNumber?: string; bankName?: string; status: "cleared" | "held" | "refunded" }>;
  contractClauses?: Array<{ id: string; clauseType: "lock_in" | "break_option" | "renewal_option" | "notice_period" | "rofr" | "reinstatement"; description: string; effectiveDate?: string; termsSummary: string }>;
  charges?: ContractChargeEntity[];
  rentSteps?: RentStepEntity[];
  documents?: ContractDocumentEntity[];
  hvacModel?: "cam_included" | "chilled_water_meter" | "fixed_psf" | "tenant_vrv" | string;
  hvacWorkingHours?: string;
  hvacOvertimeRate?: number;
  hvacFixedMonthly?: number;
  electricityBillingType?: "sub_metered" | "direct_discom" | "fixed_monthly" | string;
  powerLoadKva?: number;
  dgBackupType?: "100_percent" | "essential_only" | "none" | string;
  dgRatePerUnit?: number;
  waterBillingType?: "cam_included" | "fixed_monthly" | "sub_metered" | string;
  utilityTerms?: {
    hvacModel?: string;
    hvacWorkingHours?: string;
    hvacOvertimeRate?: number;
    hvacFixedMonthly?: number;
    electricityBillingType?: string;
    powerLoadKva?: number;
    dgBackupType?: string;
    dgRatePerUnit?: number;
    waterBillingType?: string;
  };
  utilityComponents?: any[];
  importBatchId?: string;
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
  issueDate?: string;
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
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled" | "disputed";
  isDisputed?: boolean;
  disputeReason?: string;
  disputeAmount?: number;
  disputeRemark?: string;
  disputedAt?: string;
  disputeTaskId?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  currency?: string;
  fxRate?: number;
  fxDate?: string;
  originalAmount?: number;
  reportingAmountInr?: number;
  isIfscTaxExempt?: boolean;
  paidDate?: string;
  paymentMode?: string;
  referenceNumber?: string;
  pdfUrl?: string;
  daysOverdue?: number;
  notes?: string;
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
  propertyId?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  leaseId: string;
  leaseCode: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  receiptNumber: string;
  paymentDate: string;
  depositDate?: string;
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
  isFrozen?: boolean;
  frozenAt?: string;
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
  entityType: "lease" | "invoice" | "collection" | "property" | "tenant" | string;
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

// Managed Office & Flex Centre P&L (§4.8, §5.10, §13.7, RR-FLX-08..10)
export interface FlexMemberAllocation {
  id: string;
  memberName: string;
  planName: string;
  billingBasis: "contracted" | "occupied" | "minimum_commitment" | "hybrid";
  contractedSeats: number;
  minimumSeats?: number;
  occupiedSeats: number;
  ratePerSeat: number;
  billableSeats: number;
  monthlyAmount: number;
}

export interface FlexCentreEntity {
  id: string;
  orgId: string;
  centreName: string;
  propertyId: string;
  propertyName: string;
  totalAreaSqft: number;
  seatCapacity: number;
  headLeaseCode: string;
  headLeaseMonthlyRent: number;
  headLeaseCamMonthly: number;
  landlordName: string;
  directOpexMonthly: number;
  directOpexBreakdown: {
    staffPayroll: number;
    utilitiesPower: number;
    housekeepingSupplies: number;
    highSpeedInternet: number;
  };
  meetingRoomHourlyRate: number;
  meetingRoomHoursBilled: number;
  parkingSlotRate: number;
  parkingSlotsBilled: number;
  members: FlexMemberAllocation[];
  createdAt: string;
}

// CAM Pool Budgeting & True-Up (§5.12, §13, RR-FMC-04..06, Formula F-22)
export interface CamPoolCategory {
  category: "security" | "housekeeping" | "mep_hvac" | "common_electricity" | "lifts" | "water_sanitation" | "landscaping" | "other";
  categoryName: string;
  annualBudget: number;
  actualCostYtd: number;
}

export interface CamPoolEntity {
  id: string;
  orgId: string;
  propertyId: string;
  propertyName: string;
  fyYear: string;
  totalBuildingArea: number;
  provisionalRatePsfMonth: number;
  annualBudgetTotal: number;
  actualCostTotal: number;
  categories: CamPoolCategory[];
  trueUpStatus: "draft" | "executed";
  lastTrueUpDate?: string;
  createdAt: string;
}

// Meter Readings for Utility & EB/DG billing (RR-BIL-05, RR-CAM)
export interface MeterReadingEntity {
  id: string;
  orgId: string;
  propertyId: string;
  propertyName: string;
  spaceId: string;
  unitNumber: string;
  tenantId: string;
  tenantName: string;
  meterType: "electricity_grid" | "electricity_dg" | "water" | "hvac_btu";
  meterNumber: string;
  readingDate: string;
  periodMonth: string; // "2026-10"
  previousReading: number;
  currentReading: number;
  multiplier: number;
  consumption: number; // (current - previous) * multiplier
  tariffPerUnit: number; // e.g. ₹11.50 per kWh or ₹32.00 for DG
  totalCharge: number;
  status: "draft" | "approved" | "billed";
  createdAt: string;
}

export interface ChargeMasterItem {
  id: string;
  chargeName: string;
  chargeCode: string;
  chargeType: "rent" | "cam" | "utility" | "parking" | "statutory" | "other";
  billingBasis: "psf_monthly" | "fixed_monthly" | "metered" | "per_seat";
  defaultRate: number;
  gstRate: number;
  tdsApplicable: boolean;
  tdsRate: number;
  hsnSacCode: string;
  description: string;
}

export interface RentRollSnapshotLine {
  spaceId: string;
  unitNumber: string;
  floorNumber: number;
  areaSqft: number;
  status: "occupied" | "vacant";
  tenantName?: string;
  contractCode?: string;
  contractType?: string;
  monthlyRent?: number;
  baseRentPsf?: number;
  camRatePsf?: number;
  leaseStartDate?: string;
  leaseEndDate?: string;
  escalationPct?: number;
  securityDeposit?: number;
}

export interface RentRollSnapshotEntity {
  id: string;
  orgId: string;
  snapshotMonth: string; // e.g. "2026-09"
  asOfDate: string; // e.g. "2026-09-30"
  propertyId?: string;
  propertyName?: string;
  totalArea: number;
  occupiedArea: number;
  vacantArea: number;
  occupancyPct: number;
  totalMonthlyGross: number;
  totalBaseRent: number;
  totalCam: number;
  totalSpaces: number;
  occupiedSpaces: number;
  vacantSpaces: number;
  waltYears: number;
  status: "frozen" | "draft";
  frozenAt?: string;
  frozenBy?: string;
  isLocked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
  lines: RentRollSnapshotLine[];
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
  flexCentres: FlexCentreEntity[];
  camPools: CamPoolEntity[];
  meterReadings: MeterReadingEntity[];
  snapshots?: RentRollSnapshotEntity[];
  chargeMaster?: ChargeMasterItem[];
  config: {
    leaseExpiryAlertDays: number;
    escalationAlertDays: number;
    defaultGstPct: number;
    defaultPaymentDueDays: number;
    currency: string;
    asOfDate: string;
    makerCheckerEnabled?: boolean;
    makerCheckerLease?: boolean;
    makerCheckerBilling?: boolean;
    taxProfiles?: {
      baseRentGst: number;
      camGst: number;
      isIfscTaxExempt: boolean;
      electricityGst: number;
      waterGst: number;
      parkingGst: number;
      notes?: string;
    };
    branding?: {
      logoUrl?: string;
      brandColor?: string;
      portfolioDisplayName?: string;
      invoiceHeaderMemo?: string;
    };
    domainConfig?: {
      emailSenderDomain?: string;
      isSenderDomainVerified?: boolean;
      subdomain?: string;
      customDomain?: string;
      isCustomDomainActive?: boolean;
    };
    users?: Array<{
      id: string;
      name: string;
      email: string;
      role: "org_admin" | "finance_manager" | "property_manager" | "leasing_manager" | "occupant";
      makerCheckerRole?: "maker" | "checker" | "approver";
      status: "active" | "invited";
    }>;
    chargeTypesList?: Array<{
      id: string;
      name: string;
      category: "rent" | "cam" | "utility" | "service" | "amenity";
      enabled: boolean;
      rate: number;
      unit: "psf_month" | "kwh" | "kl" | "slot_month" | "fixed_month" | "per_seat";
      isInclusion: boolean;
      description?: string;
    }>;
    goLiveChecklist?: {
      dataQualityVerified: boolean;
      userTrainingCompleted: boolean;
      testBillingRunCompleted: boolean;
      parallelRunAgreed: boolean;
      occupantCommunicationSent: boolean;
    };
    tallyConfig?: {
      serverUrl: string;
      companyName: string;
      autoSyncOnApproval: boolean;
      ledgers: {
        rentIncome: string;
        camIncome: string;
        cgst: string;
        sgst: string;
        igst: string;
        bankLedger: string;
        tdsLedger: string;
        partyGroup: string;
      };
      lastSyncTimestamp: string | null;
      lastSyncStatus: string | null;
      lastSyncMessage: string | null;
    };
    zohoConfig?: {
      orgId: string;
      authToken: string;
      domain: string;
      isConnected: boolean;
      lastSyncTimestamp: string | null;
      lastSyncStatus: string | null;
      lastSyncMessage: string | null;
    };
  };
  isCleanPortfolio?: boolean;
}

const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const SEED_DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data');
const SEED_DB_FILE = path.join(SEED_DATA_DIR, 'rent-roll-db.json');

const RUNTIME_DATA_DIR = IS_SERVERLESS ? '/tmp/data' : SEED_DATA_DIR;
const DB_FILE = path.join(RUNTIME_DATA_DIR, 'rent-roll-db.json');

// Global memory cache preserving DB across function invocations
let memoryDbInstance: RentRollDatabase | null = null;

// Ensure directory exists and seed if running in /tmp
function ensureDataDir() {
  try {
    if (!fs.existsSync(RUNTIME_DATA_DIR)) {
      fs.mkdirSync(RUNTIME_DATA_DIR, { recursive: true });
    }
    if (IS_SERVERLESS && !fs.existsSync(DB_FILE) && fs.existsSync(SEED_DB_FILE)) {
      fs.copyFileSync(SEED_DB_FILE, DB_FILE);
    }
  } catch (err) {
    // Non-blocking fallback
  }
}

// Pristine Clean Database Builder (Zero Fake Data)
export function getEmptyDatabase(): RentRollDatabase {
  return {
    organization: {
      id: "org-officex-001",
      name: "",
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
    flexCentres: [],
    camPools: [],
    meterReadings: [],
    chargeMaster: [
      {
        id: "CHG-RENT",
        chargeName: "Monthly Base Rent",
        chargeCode: "BASE_RENT",
        chargeType: "rent",
        billingBasis: "psf_monthly",
        defaultRate: 150,
        gstRate: 18,
        tdsApplicable: true,
        tdsRate: 10,
        hsnSacCode: "997212",
        description: "Standard commercial office space lease base rental"
      },
      {
        id: "CHG-CAM",
        chargeName: "Common Area Maintenance (CAM)",
        chargeCode: "CAM_PROVISIONAL",
        chargeType: "cam",
        billingBasis: "psf_monthly",
        defaultRate: 28,
        gstRate: 18,
        tdsApplicable: false,
        tdsRate: 0,
        hsnSacCode: "998599",
        description: "Comprehensive facility, security, HVAC, lifts and upkeep maintenance"
      },
      {
        id: "CHG-EB-GRID",
        chargeName: "Grid Power Consumption",
        chargeCode: "EB_GRID",
        chargeType: "utility",
        billingBasis: "metered",
        defaultRate: 11.50,
        gstRate: 18,
        tdsApplicable: false,
        tdsRate: 0,
        hsnSacCode: "998631",
        description: "State utility HT electricity meter consumption charge"
      },
      {
        id: "CHG-EB-DG",
        chargeName: "DG Backup Power Consumption",
        chargeCode: "EB_DG",
        chargeType: "utility",
        billingBasis: "metered",
        defaultRate: 32.00,
        gstRate: 18,
        tdsApplicable: false,
        tdsRate: 0,
        hsnSacCode: "998631",
        description: "Diesel Generator captive backup power supply charge per kWh"
      },
      {
        id: "CHG-PARKING",
        chargeName: "Reserved Basement Car Parking",
        chargeCode: "PARKING_RESERVED",
        chargeType: "parking",
        billingBasis: "fixed_monthly",
        defaultRate: 4500,
        gstRate: 18,
        tdsApplicable: false,
        tdsRate: 0,
        hsnSacCode: "996729",
        description: "Allotted reserved basement / stilt vehicular parking slots"
      }
    ],
    config: {
      leaseExpiryAlertDays: 90,
      escalationAlertDays: 30,
      defaultGstPct: 18,
      defaultPaymentDueDays: 15,
      currency: "INR",
      asOfDate: new Date().toISOString().split("T")[0],
      makerCheckerEnabled: true,
    },
    isCleanPortfolio: true,
  };
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
    },
    {
      id: "BE-GFT-01",
      orgId: org.id,
      clientAccountId: "CA-SELF",
      legalName: "Aurum IFSC Special Entity",
      tradeName: "GIFT Tower One IFSC",
      pan: "AAFCO7766F",
      gstin: "24AAFCO7766F1Z8",
      stateCode: "24",
      registeredAddress: "GIFT City Corridor, Zone 1, Gandhinagar, Gujarat 382355",
      bankName: "State Bank of India IFSC",
      bankAccountNumber: "402000112233",
      bankIfsc: "SBIN0012345",
      bankBranch: "GIFT City IFSC",
      invoicePrefix: "GFT-INV",
      isDefault: false
    },
    {
      id: "BE-FLX-01",
      orgId: org.id,
      clientAccountId: "CA-SELF",
      legalName: "Brightspace Workspace Operations Pvt Ltd",
      tradeName: "Brightspace Flex",
      pan: "AAFCO3322F",
      gstin: "06AAFCO3322F1Z1",
      stateCode: "06",
      registeredAddress: "Plot 18, Sector 44 Institutional Area, Gurugram 122003",
      bankName: "Kotak Mahindra Bank Ltd",
      bankAccountNumber: "8012345678",
      bankIfsc: "KKBK0000123",
      bankBranch: "Sector 44 Gurugram",
      invoicePrefix: "BS-INV",
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
      feeRate: 4.0, // 4.0% of total collections (Document Section 13.8)
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
      totalArea: 98400,
      chargeableArea: 98400,
      carpetArea: 68900,
      occupancyTargetPct: 95,
      assetValue: 18500000000,
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
      totalArea: 110000,
      chargeableArea: 110000,
      carpetArea: 77000,
      occupancyTargetPct: 92,
      assetValue: 21000000000,
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
      totalArea: 85000,
      chargeableArea: 85000,
      carpetArea: 59500,
      occupancyTargetPct: 90,
      assetValue: 9800000000,
      operatingCurrency: "INR"
    },
    {
      id: "PROP-GIFT",
      orgId: org.id,
      propertyCode: "GIFT-IFSC",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-GFT-01",
      name: "GIFT Tower One IFSC",
      type: "IFSC FinTech Center",
      address: "GIFT City Corridor, Zone 1",
      city: "Gandhinagar",
      state: "Gujarat",
      microMarket: "GIFT City Special Economic Zone",
      pincode: "382355",
      grade: "A+",
      totalArea: 50000,
      chargeableArea: 50000,
      carpetArea: 35000,
      occupancyTargetPct: 88,
      assetValue: 6500000000,
      operatingCurrency: "USD"
    },
    {
      id: "PROP-FLX",
      orgId: org.id,
      propertyCode: "FLX-SEC44",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-FLX-01",
      name: "Brightspace Flex Centre",
      type: "flex_centre",
      address: "Plot 18, Sector 44 Institutional Area",
      city: "Gurugram",
      state: "Haryana",
      microMarket: "Sector 44",
      pincode: "122003",
      grade: "A",
      totalArea: 18000,
      chargeableArea: 18000,
      carpetArea: 12600,
      occupancyTargetPct: 85,
      assetValue: 1200000000,
      operatingCurrency: "INR"
    }
  ];

  const spaces: SpaceEntity[] = [
    // APX-BKC Spaces (Table 96)
    { id: "SPC-APX-05A", propertyId: "PROP-APX", spaceCode: "APX-05A", buildingName: "Apex Tower", floorNumber: 5, unitNumber: "APX-05A", spaceType: "office", carpetArea: 5950, chargeableArea: 8500, standardRatePsf: 285.20, standardCamPsf: 28, status: "leased", currentLeaseId: "LEASE-APX-01" },
    { id: "SPC-APX-07", propertyId: "PROP-APX", spaceCode: "APX-07", buildingName: "Apex Tower", floorNumber: 7, unitNumber: "APX-07", spaceType: "office", carpetArea: 8400, chargeableArea: 12000, standardRatePsf: 290, standardCamPsf: 28, status: "in_negotiation", currentLeaseId: "LEASE-APX-02" },
    { id: "SPC-APX-08", propertyId: "PROP-APX", spaceCode: "APX-08", buildingName: "Apex Tower", floorNumber: 8, unitNumber: "APX-08", spaceType: "office", carpetArea: 7140, chargeableArea: 10200, standardRatePsf: 275, standardCamPsf: 28, status: "leased", currentLeaseId: "LEASE-APX-03" },
    { id: "SPC-APX-09", propertyId: "PROP-APX", spaceCode: "APX-09", buildingName: "Apex Tower", floorNumber: 9, unitNumber: "APX-09 (Vacant)", spaceType: "office", carpetArea: 7140, chargeableArea: 10200, standardRatePsf: 290, standardCamPsf: 28, standardMarketRentPsf: 290, potentialMonthlyRent: 2958000, status: "available" },
    
    // MTP-GGN Spaces (Table 96)
    { id: "SPC-MTP-01", propertyId: "PROP-MTP", spaceCode: "MTP-T1-03", buildingName: "Tower 1", floorNumber: 3, unitNumber: "MTP-T1-03", spaceType: "office", carpetArea: 15400, chargeableArea: 22000, standardRatePsf: 95, standardCamPsf: 14, status: "leased", currentLeaseId: "LEASE-MTP-01" },
    { id: "SPC-MTP-02", propertyId: "PROP-MTP", spaceCode: "MTP-T1-04", buildingName: "Tower 1", floorNumber: 4, unitNumber: "MTP-T1-04", spaceType: "office", carpetArea: 15400, chargeableArea: 22000, standardRatePsf: 92, standardCamPsf: 14, status: "occupied", currentLeaseId: "LEASE-MTP-02" },
    { id: "SPC-MTP-03", propertyId: "PROP-MTP", spaceCode: "MTP-T2-01", buildingName: "Tower 2", floorNumber: 1, unitNumber: "MTP-T2-01", spaceType: "office", carpetArea: 12950, chargeableArea: 18500, standardRatePsf: 98, standardCamPsf: 14, status: "leased", currentLeaseId: "LEASE-MTP-03" },
    { id: "SPC-MTP-04", propertyId: "PROP-MTP", spaceCode: "MTP-T2-02", buildingName: "Tower 2", floorNumber: 2, unitNumber: "MTP-T2-02 (Reserved)", spaceType: "office", carpetArea: 12950, chargeableArea: 18500, standardRatePsf: 100, standardCamPsf: 14, standardMarketRentPsf: 100, potentialMonthlyRent: 1850000, status: "reserved" },

    // NXH-NDA Spaces (Table 96)
    { id: "SPC-NXH-G01", propertyId: "PROP-NXN", spaceCode: "NXH-G01", buildingName: "Block A", floorNumber: 0, unitNumber: "NXH-G01", spaceType: "retail", carpetArea: 1680, chargeableArea: 2400, standardRatePsf: 160, standardCamPsf: 18, status: "leased", currentLeaseId: "LEASE-NXN-01" },
    { id: "SPC-NXH-03", propertyId: "PROP-NXN", spaceCode: "NXH-03", buildingName: "Block A", floorNumber: 3, unitNumber: "NXH-03", spaceType: "office", carpetArea: 10500, chargeableArea: 15000, standardRatePsf: 72, standardCamPsf: 12, status: "leased", currentLeaseId: "LEASE-NXN-02" },
    { id: "SPC-NXH-04", propertyId: "PROP-NXN", spaceCode: "NXH-04", buildingName: "Block A", floorNumber: 4, unitNumber: "NXH-04", spaceType: "office", carpetArea: 10500, chargeableArea: 15000, standardRatePsf: 70, standardCamPsf: 12, status: "leased", currentLeaseId: "LEASE-NXN-03" },
    { id: "SPC-NXH-05", propertyId: "PROP-NXN", spaceCode: "NXH-05", buildingName: "Block A", floorNumber: 5, unitNumber: "NXH-05 (Vacant)", spaceType: "office", carpetArea: 10500, chargeableArea: 15000, standardRatePsf: 75, standardCamPsf: 12, standardMarketRentPsf: 75, potentialMonthlyRent: 1125000, status: "available" },

    // GFT-IFSC Spaces (Table 96)
    { id: "SPC-GFT-11A", propertyId: "PROP-GIFT", spaceCode: "GFT-11A", buildingName: "IFSC Tower", floorNumber: 11, unitNumber: "GFT-11A", spaceType: "office", carpetArea: 4200, chargeableArea: 6000, standardRatePsf: 105, standardCamPsf: 12.6, status: "leased", currentLeaseId: "LEASE-GFT-01" },

    // Brightspace Flex Spaces (Table 102)
    { id: "SPC-FLX-01", propertyId: "PROP-FLX", spaceCode: "FLX-CABIN", buildingName: "Brightspace Flex", floorNumber: 4, unitNumber: "Enterprise Cabin 4A", spaceType: "cabin", carpetArea: 5250, chargeableArea: 7500, seatCapacity: 100, standardRatePsf: 164, standardCamPsf: 0, status: "occupied", currentLeaseId: "LEASE-FLX-01" },
    { id: "SPC-FLX-02", propertyId: "PROP-FLX", spaceCode: "FLX-DESK", buildingName: "Brightspace Flex", floorNumber: 4, unitNumber: "Dedicated Desks Bay 4B", spaceType: "flex_desk", carpetArea: 3150, chargeableArea: 4500, seatCapacity: 60, standardRatePsf: 153, standardCamPsf: 0, status: "occupied", currentLeaseId: "LEASE-FLX-02" },
    { id: "SPC-FLX-03", propertyId: "PROP-FLX", spaceCode: "FLX-TEAM", buildingName: "Brightspace Flex", floorNumber: 4, unitNumber: "Team Room 4C", spaceType: "meeting_room", carpetArea: 2100, chargeableArea: 3000, seatCapacity: 35, standardRatePsf: 140, standardCamPsf: 0, status: "occupied", currentLeaseId: "LEASE-FLX-03" },
    { id: "SPC-FLX-04", propertyId: "PROP-FLX", spaceCode: "FLX-OPEN", buildingName: "Brightspace Flex", floorNumber: 4, unitNumber: "Hot Desk Zone 4D", spaceType: "flex_floor", carpetArea: 2100, chargeableArea: 3000, seatCapacity: 45, standardRatePsf: 125, standardCamPsf: 0, status: "occupied", currentLeaseId: "LEASE-FLX-04" }
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
      id: "TEN-NEXTGEN",
      orgId: org.id,
      tenantCode: "TNT-NG-05",
      tradeName: "NextGen Retail Services Pvt Ltd",
      legalName: "NextGen Retail Services Private Limited",
      industry: "Retail Technology",
      pan: "AABCN3344M",
      gstin: "06AABCN3344M1Z6",
      contactPerson: "Rajeev Bansal (Director)",
      contactEmail: "rajeev@nextgenretail.in",
      contactPhone: "+91 98112 55667",
      billingAddress: "Tower 1, Meridian Tech Park",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122002",
      status: "active",
      creditLimit: 20000000,
      paymentTermsDays: 15,
      createdAt: "2020-01-01"
    },
    {
      id: "TEN-ZENITH",
      orgId: org.id,
      tenantCode: "TNT-ZP-06",
      tradeName: "Zenith Pharma Research Pvt Ltd",
      legalName: "Zenith Pharmaceutical Research India Pvt Ltd",
      industry: "Pharmaceuticals & Healthcare",
      pan: "AABCZ5566P",
      gstin: "06AABCZ5566P1Z3",
      contactPerson: "Dr. Arvind Swaminathan",
      contactEmail: "arvind.s@zenithpharma.com",
      contactPhone: "+91 98450 12345",
      billingAddress: "Tower 2, Meridian Tech Park",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122002",
      status: "active",
      creditLimit: 45000000,
      paymentTermsDays: 15,
      createdAt: "2024-06-01"
    },
    {
      id: "TEN-FRESHMART",
      orgId: org.id,
      tenantCode: "TNT-FM-07",
      tradeName: "FreshMart Retail Pvt Ltd",
      legalName: "FreshMart Omnichannel Retail Private Limited",
      industry: "Supermarket & Grocery Retail",
      pan: "AABCF7788Q",
      gstin: "09AABCF7788Q1Z1",
      contactPerson: "Manish Agarwal",
      contactEmail: "manish@freshmart.in",
      contactPhone: "+91 99100 88992",
      billingAddress: "Ground Floor, Nexus Hub, Sector 62",
      billingCity: "Noida",
      billingState: "Uttar Pradesh",
      billingPincode: "201301",
      status: "active",
      creditLimit: 15000000,
      paymentTermsDays: 10,
      createdAt: "2026-08-01"
    },
    {
      id: "TEN-ORBIT",
      orgId: org.id,
      tenantCode: "TNT-OE-08",
      tradeName: "Orbit Edutech Pvt Ltd",
      legalName: "Orbit Edutech Learning Solutions Pvt Ltd",
      industry: "Education Technology",
      pan: "AABCO9900R",
      gstin: "09AABCO9900R1Z8",
      contactPerson: "Shalini Roy",
      contactEmail: "shalini.roy@orbitedu.com",
      contactPhone: "+91 98711 22334",
      billingAddress: "Floor 3, Nexus Hub, Sector 62",
      billingCity: "Noida",
      billingState: "Uttar Pradesh",
      billingPincode: "201301",
      status: "active",
      creditLimit: 25000000,
      paymentTermsDays: 15,
      createdAt: "2022-03-01"
    },
    {
      id: "TEN-KESTREL",
      orgId: org.id,
      tenantCode: "TNT-KE-09",
      tradeName: "Kestrel Engineering Services Ltd",
      legalName: "Kestrel Engineering & Project Management Ltd",
      industry: "Civil & Infrastructure Engineering",
      pan: "AABCK1122S",
      gstin: "09AABCK1122S1Z5",
      contactPerson: "Capt. Vivek Sethi",
      contactEmail: "vivek.sethi@kestreleng.com",
      contactPhone: "+91 98101 77665",
      billingAddress: "Floor 4, Nexus Hub, Sector 62",
      billingCity: "Noida",
      billingState: "Uttar Pradesh",
      billingPincode: "201301",
      status: "active",
      creditLimit: 30000000,
      paymentTermsDays: 15,
      createdAt: "2025-04-01"
    },
    {
      id: "TEN-AURUM",
      orgId: org.id,
      tenantCode: "TNT-AG-10",
      tradeName: "Aurum Global Fund Services IFSC Pvt Ltd",
      legalName: "Aurum Global Fund Administration Services IFSC Pvt Ltd",
      industry: "Alternative Investment & Fund Admin",
      pan: "AABCA3344T",
      gstin: "24AABCA3344T1Z2",
      contactPerson: "James Sterling (Managing Director)",
      contactEmail: "j.sterling@aurumglobal.com",
      contactPhone: "+91 79 4001 2233",
      billingAddress: "IFSC Tower, Suite 11A, GIFT City",
      billingCity: "Gandhinagar",
      billingState: "Gujarat",
      billingPincode: "382355",
      status: "active",
      creditLimit: 50000000,
      paymentTermsDays: 15,
      createdAt: "2025-10-01"
    },
    {
      id: "TEN-BRIGHTPATH",
      orgId: org.id,
      tenantCode: "TNT-BP-11",
      tradeName: "Brightpath Analytics Pvt Ltd",
      legalName: "Brightpath Predictive Analytics India Pvt Ltd",
      industry: "Data Analytics & AI",
      pan: "AABCB5566U",
      gstin: "06AABCB5566U1Z9",
      contactPerson: "Kavita Rao",
      contactEmail: "kavita.rao@brightpath.ai",
      contactPhone: "+91 98114 99881",
      billingAddress: "Brightspace Flex, Sector 44",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122003",
      status: "active",
      creditLimit: 20000000,
      paymentTermsDays: 7,
      createdAt: "2025-04-01"
    },
    {
      id: "TEN-NIMBUS",
      orgId: org.id,
      tenantCode: "TNT-NL-12",
      tradeName: "Nimbus Labs Pvt Ltd",
      legalName: "Nimbus Autonomous Labs India Pvt Ltd",
      industry: "Robotics & Automation",
      pan: "AABCN7788V",
      gstin: "06AABCN7788V1Z6",
      contactPerson: "Dr. Nikhil Sen",
      contactEmail: "nikhil@nimbuslabs.io",
      contactPhone: "+91 98118 77662",
      billingAddress: "Brightspace Flex, Sector 44",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122003",
      status: "active",
      creditLimit: 15000000,
      paymentTermsDays: 7,
      createdAt: "2025-06-01"
    },
    {
      id: "TEN-VERITAS",
      orgId: org.id,
      tenantCode: "TNT-VL-13",
      tradeName: "Veritas Legal LLP",
      legalName: "Veritas Corporate & Commercial Legal Advisors LLP",
      industry: "Legal & Advisory",
      pan: "AACFV9900W",
      gstin: "06AACFV9900W1Z3",
      contactPerson: "Sameer Chawla",
      contactEmail: "sameer@veritaslegal.in",
      contactPhone: "+91 98102 33441",
      billingAddress: "Brightspace Flex, Sector 44",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122003",
      status: "active",
      creditLimit: 10000000,
      paymentTermsDays: 7,
      createdAt: "2025-07-01"
    },
    {
      id: "TEN-HOTDESK",
      orgId: org.id,
      tenantCode: "TNT-HD-14",
      tradeName: "Hot Desk Enterprise Members Pool",
      legalName: "OfficeX Flex Network Member Pool",
      industry: "Freelance & Remote Enterprise",
      pan: "AABCH1122X",
      gstin: "06AABCH1122X1Z0",
      contactPerson: "Community Manager",
      contactEmail: "flex.members@brightspace.in",
      contactPhone: "+91 98200 11000",
      billingAddress: "Brightspace Flex, Sector 44",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122003",
      status: "active",
      creditLimit: 5000000,
      paymentTermsDays: 5,
      createdAt: "2026-01-01"
    },
    {
      id: "TEN-VIRTUAL",
      orgId: org.id,
      tenantCode: "TNT-VO-15",
      tradeName: "Virtual Office Member Network",
      legalName: "Virtual Office Corporate Registered Clients",
      industry: "Startups & Remote Consultancies",
      pan: "AABCV3344Y",
      gstin: "06AABCV3344Y1Z7",
      contactPerson: "Registration Coordinator",
      contactEmail: "virtual@brightspace.in",
      contactPhone: "+91 98200 22000",
      billingAddress: "Brightspace Flex, Sector 44",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPincode: "122003",
      status: "active",
      creditLimit: 2000000,
      paymentTermsDays: 5,
      createdAt: "2026-01-01"
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

  // 16 Canonical Contracts from Section 13 (Tables 96, 97, and 102)
  const rawLeases: Array<any> = [
    // 1. APX-05A: TechNova Solutions (Table 96 Row 1)
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
      carpetArea: 5950,
      baseRentPsf: 285.20,
      monthlyRent: 2424200,
      camRatePsf: 28,
      camMonthly: 238000,
      utilityFixedMonthly: 35000,
      parkingChargesMonthly: 40000,
      signageChargesMonthly: 15000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 12648000, // Shortfall vs required 1,45,45,200
      escalationPct: 15,
      escalationFrequencyMonths: 36,
      nextEscalationDate: "2026-04-01",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "active"
    },
    // 2. APX-07: Global Logistics (Table 96 Row 2, Deal/Pipeline)
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
      carpetArea: 8400,
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
    // 3. APX-08: Apex Financial Advisors (Table 96 Row 3, Critical, Expiry < 12m)
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
      carpetArea: 7140,
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
    // 4. MTP-T1-03: Innovate Corp (Table 96 Row 5, Escalation Due 01-Nov-26)
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
      carpetArea: 15400,
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
    // 5. MTP-T1-04: NextGen Retail (Table 96 Row 6, Holding Over, Arrears 62d)
    {
      id: "LEASE-MTP-02",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-MTP-01",
      propertyId: "PROP-MTP",
      spaceId: "SPC-MTP-02",
      unitNumber: "MTP-T1-04",
      floorNumber: 4,
      tenantId: "TEN-NEXTGEN",
      leaseCode: "MTP-L-0099",
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      lockInEndDate: "2022-12-31",
      noticePeriodDays: 90,
      chargeableArea: 22000,
      carpetArea: 15400,
      baseRentPsf: 92,
      monthlyRent: 2024000,
      camRatePsf: 14,
      camMonthly: 308000,
      utilityFixedMonthly: 45000,
      parkingChargesMonthly: 60000,
      signageChargesMonthly: 20000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 12144000,
      escalationPct: 15,
      escalationFrequencyMonths: 36,
      nextEscalationDate: "2026-01-01",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "active"
    },
    // 6. MTP-T2-01: Zenith Pharma (Table 96 Row 7, 3m rent-free)
    {
      id: "LEASE-MTP-03",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-MTP-01",
      propertyId: "PROP-MTP",
      spaceId: "SPC-MTP-03",
      unitNumber: "MTP-T2-01",
      floorNumber: 1,
      tenantId: "TEN-ZENITH",
      leaseCode: "MTP-L-0112",
      startDate: "2024-06-01",
      endDate: "2033-05-31",
      lockInEndDate: "2027-05-31",
      noticePeriodDays: 90,
      chargeableArea: 18500,
      carpetArea: 12950,
      baseRentPsf: 98,
      monthlyRent: 1813000,
      camRatePsf: 14,
      camMonthly: 259000,
      utilityFixedMonthly: 40000,
      parkingChargesMonthly: 50000,
      signageChargesMonthly: 15000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 10878000,
      escalationPct: 4.5,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-06-01",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "active"
    },
    // 7. NXH-G01: FreshMart Retail (Table 96 Row 9, MG + 8% turnover)
    {
      id: "LEASE-NXN-01",
      clientAccountId: "CA-SHARMA",
      billingEntityId: "BE-NXN-01",
      propertyId: "PROP-NXN",
      spaceId: "SPC-NXH-G01",
      unitNumber: "NXH-G01",
      floorNumber: 0,
      tenantId: "TEN-FRESHMART",
      leaseCode: "NX-L-0015",
      startDate: "2026-08-01",
      endDate: "2035-07-31",
      lockInEndDate: "2029-07-31",
      noticePeriodDays: 90,
      chargeableArea: 2400,
      carpetArea: 1680,
      baseRentPsf: 160,
      monthlyRent: 384000,
      camRatePsf: 18,
      camMonthly: 43200,
      utilityFixedMonthly: 15000,
      parkingChargesMonthly: 20000,
      signageChargesMonthly: 10000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 2304000,
      escalationPct: 5,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-08-01",
      billingModel: "revenue_share",
      contractType: "commercial_lease",
      status: "active"
    },
    // 8. NXH-03: Orbit Edutech (Table 96 Row 10, Notice Served, Exit 28-Feb-27)
    {
      id: "LEASE-NXN-02",
      clientAccountId: "CA-SHARMA",
      billingEntityId: "BE-NXN-01",
      propertyId: "PROP-NXN",
      spaceId: "SPC-NXH-03",
      unitNumber: "NXH-03",
      floorNumber: 3,
      tenantId: "TEN-ORBIT",
      leaseCode: "NX-L-0008",
      startDate: "2022-03-01",
      endDate: "2027-02-28",
      lockInEndDate: "2025-02-28",
      noticePeriodDays: 90,
      chargeableArea: 15000,
      carpetArea: 10500,
      baseRentPsf: 72,
      monthlyRent: 1080000,
      camRatePsf: 12,
      camMonthly: 180000,
      utilityFixedMonthly: 30000,
      parkingChargesMonthly: 40000,
      signageChargesMonthly: 10000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 6480000,
      escalationPct: 5,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-03-01",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "under_notice"
    },
    // 9. NXH-04: Kestrel Engineering (Table 96 Row 11)
    {
      id: "LEASE-NXN-03",
      clientAccountId: "CA-SHARMA",
      billingEntityId: "BE-NXN-01",
      propertyId: "PROP-NXN",
      spaceId: "SPC-NXH-04",
      unitNumber: "NXH-04",
      floorNumber: 4,
      tenantId: "TEN-KESTREL",
      leaseCode: "NX-L-0012",
      startDate: "2025-04-01",
      endDate: "2034-03-31",
      lockInEndDate: "2028-03-31",
      noticePeriodDays: 90,
      chargeableArea: 15000,
      carpetArea: 10500,
      baseRentPsf: 70,
      monthlyRent: 1050000,
      camRatePsf: 12,
      camMonthly: 180000,
      utilityFixedMonthly: 30000,
      parkingChargesMonthly: 40000,
      signageChargesMonthly: 10000,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 6300000,
      escalationPct: 15,
      escalationFrequencyMonths: 36,
      nextEscalationDate: "2028-04-01",
      billingModel: "area",
      contractType: "commercial_lease",
      status: "active"
    },
    // 10. GFT-11A: Aurum Global Fund Services (Table 96 Row 13, USD IFSC SEZ)
    {
      id: "LEASE-GFT-01",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-GFT-01",
      propertyId: "PROP-GIFT",
      spaceId: "SPC-GFT-11A",
      unitNumber: "GFT-11A",
      floorNumber: 11,
      tenantId: "TEN-AURUM",
      leaseCode: "GFT-L-0005",
      startDate: "2025-10-01",
      endDate: "2031-09-30",
      lockInEndDate: "2028-09-30",
      noticePeriodDays: 90,
      chargeableArea: 6000,
      carpetArea: 4200,
      baseRentPsf: 105, // USD 1.25 @ 84 = INR 105
      monthlyRent: 630000, // USD 7,500 @ 84
      camRatePsf: 12.6, // USD 0.15 @ 84
      camMonthly: 75600,
      utilityFixedMonthly: 20000,
      parkingChargesMonthly: 30000,
      signageChargesMonthly: 10000,
      otherChargesMonthly: 0,
      securityDepositMonths: 3,
      securityDepositPaid: 1890000,
      escalationPct: 5,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2026-10-01",
      billingModel: "area",
      contractType: "commercial_lease",
      currency: "USD",
      status: "active"
    },
    // 11. FLX-CABIN: Brightpath Analytics (Table 102 Row 1, Min Commitment)
    {
      id: "LEASE-FLX-01",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-FLX-01",
      propertyId: "PROP-FLX",
      spaceId: "SPC-FLX-01",
      unitNumber: "Enterprise Cabin 4A",
      floorNumber: 4,
      tenantId: "TEN-BRIGHTPATH",
      leaseCode: "BS-FLX-001",
      startDate: "2025-04-01",
      endDate: "2028-03-31",
      lockInEndDate: "2026-03-31",
      noticePeriodDays: 60,
      chargeableArea: 7500,
      carpetArea: 5250,
      baseRentPsf: 164,
      monthlyRent: 1230000, // 82 billable seats @ 15,000
      camRatePsf: 0,
      camMonthly: 0,
      utilityFixedMonthly: 0,
      parkingChargesMonthly: 0,
      signageChargesMonthly: 0,
      otherChargesMonthly: 0,
      securityDepositMonths: 2,
      securityDepositPaid: 2460000,
      escalationPct: 8,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-04-01",
      billingModel: "seat",
      contractType: "coworking_membership",
      status: "active"
    },
    // 12. FLX-DESK: Nimbus Labs (Table 102 Row 2, Contracted Seats)
    {
      id: "LEASE-FLX-02",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-FLX-01",
      propertyId: "PROP-FLX",
      spaceId: "SPC-FLX-02",
      unitNumber: "Dedicated Desks Bay 4B",
      floorNumber: 4,
      tenantId: "TEN-NIMBUS",
      leaseCode: "BS-FLX-002",
      startDate: "2025-06-01",
      endDate: "2028-05-31",
      lockInEndDate: "2026-05-31",
      noticePeriodDays: 60,
      chargeableArea: 4500,
      carpetArea: 3150,
      baseRentPsf: 153.33,
      monthlyRent: 690000, // 60 contracted seats @ 11,500
      camRatePsf: 0,
      camMonthly: 0,
      utilityFixedMonthly: 0,
      parkingChargesMonthly: 0,
      signageChargesMonthly: 0,
      otherChargesMonthly: 0,
      securityDepositMonths: 2,
      securityDepositPaid: 1380000,
      escalationPct: 8,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-06-01",
      billingModel: "seat",
      contractType: "coworking_membership",
      status: "active"
    },
    // 13. FLX-TEAM: Veritas Legal (Table 102 Row 4, Hybrid)
    {
      id: "LEASE-FLX-03",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-FLX-01",
      propertyId: "PROP-FLX",
      spaceId: "SPC-FLX-03",
      unitNumber: "Team Room 4C",
      floorNumber: 4,
      tenantId: "TEN-VERITAS",
      leaseCode: "BS-FLX-003",
      startDate: "2025-07-01",
      endDate: "2028-06-30",
      lockInEndDate: "2026-06-30",
      noticePeriodDays: 60,
      chargeableArea: 3000,
      carpetArea: 2100,
      baseRentPsf: 140,
      monthlyRent: 420000, // Base 3,00,000 + 10 extra @ 12,000
      camRatePsf: 0,
      camMonthly: 0,
      utilityFixedMonthly: 0,
      parkingChargesMonthly: 0,
      signageChargesMonthly: 0,
      otherChargesMonthly: 0,
      securityDepositMonths: 2,
      securityDepositPaid: 840000,
      escalationPct: 8,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-07-01",
      billingModel: "hybrid",
      contractType: "coworking_membership",
      status: "active"
    },
    // 14. FLX-OPEN: Hot Desk Pool (Table 102 Row 3, Occupied Seats)
    {
      id: "LEASE-FLX-04",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-FLX-01",
      propertyId: "PROP-FLX",
      spaceId: "SPC-FLX-04",
      unitNumber: "Hot Desk Zone 4D",
      floorNumber: 4,
      tenantId: "TEN-HOTDESK",
      leaseCode: "BS-FLX-004",
      startDate: "2026-01-01",
      endDate: "2027-12-31",
      lockInEndDate: "2026-06-30",
      noticePeriodDays: 30,
      chargeableArea: 3000,
      carpetArea: 2100,
      baseRentPsf: 75,
      monthlyRent: 225000, // 30 occupied @ 7,500
      camRatePsf: 0,
      camMonthly: 0,
      utilityFixedMonthly: 0,
      parkingChargesMonthly: 0,
      signageChargesMonthly: 0,
      otherChargesMonthly: 0,
      securityDepositMonths: 1,
      securityDepositPaid: 225000,
      escalationPct: 5,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-01-01",
      billingModel: "seat",
      contractType: "coworking_membership",
      status: "active"
    },
    // 15. FLX-VIRTUAL: Virtual Office (Table 102 Row 5, Contracted)
    {
      id: "LEASE-FLX-05",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-FLX-01",
      propertyId: "PROP-FLX",
      spaceId: "SPC-FLX-04",
      unitNumber: "Virtual Office Bay",
      floorNumber: 4,
      tenantId: "TEN-VIRTUAL",
      leaseCode: "BS-FLX-005",
      startDate: "2026-01-01",
      endDate: "2027-12-31",
      lockInEndDate: "2026-06-30",
      noticePeriodDays: 30,
      chargeableArea: 1000,
      carpetArea: 700,
      baseRentPsf: 75,
      monthlyRent: 75000, // 30 contracted @ 2,500
      camRatePsf: 0,
      camMonthly: 0,
      utilityFixedMonthly: 0,
      parkingChargesMonthly: 0,
      signageChargesMonthly: 0,
      otherChargesMonthly: 0,
      securityDepositMonths: 1,
      securityDepositPaid: 75000,
      escalationPct: 5,
      escalationFrequencyMonths: 12,
      nextEscalationDate: "2027-01-01",
      billingModel: "seat",
      contractType: "coworking_membership",
      status: "active"
    },
    // 16. FLX-HEAD: Head Lease for Brightspace Flex (Table 103, Payable Head Lease)
    {
      id: "LEASE-FLX-HEAD",
      clientAccountId: "CA-SELF",
      billingEntityId: "BE-FLX-01",
      propertyId: "PROP-FLX",
      spaceId: "SPC-FLX-01",
      unitNumber: "Entire 4th Floor",
      floorNumber: 4,
      tenantId: "TEN-INNOVATE",
      leaseCode: "HL-SEC44-01",
      direction: "payable",
      startDate: "2025-01-01",
      endDate: "2034-12-31",
      lockInEndDate: "2028-12-31",
      noticePeriodDays: 180,
      chargeableArea: 18000,
      carpetArea: 12600,
      baseRentPsf: 95,
      monthlyRent: 1710000, // 18,000 sqft @ 95/sqft
      camRatePsf: 15,
      camMonthly: 270000, // 18,000 sqft @ 15/sqft
      utilityFixedMonthly: 60000,
      parkingChargesMonthly: 48000,
      signageChargesMonthly: 0,
      otherChargesMonthly: 0,
      securityDepositMonths: 6,
      securityDepositPaid: 10260000,
      escalationPct: 15,
      escalationFrequencyMonths: 36,
      nextEscalationDate: "2028-01-01",
      billingModel: "area",
      contractType: "head_lease",
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
      direction: rl.direction || "receivable",
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

  // 14 Canonical Invoices including Table 98 Worked Example
  const invoices: InvoiceEntity[] = [
    // Table 98: TechNova Solutions October 2026 Separate Component Invoices
    {
      id: "INV-2026-OCT-01",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      tenantId: "TEN-TECHNOVA",
      tenantName: "TechNova Solutions Pvt Ltd",
      invoiceNumber: "APX-INV-2026-OCT-01",
      fyYear: "2026-27",
      invoiceDate: "2026-10-01",
      dueDate: "2026-10-15",
      periodStart: "2026-10-01",
      periodEnd: "2026-10-31",
      invoiceType: "rent",
      baseRent: 1000000,
      camCharges: 0,
      utilityCharges: 0,
      otherCharges: 0,
      subtotal: 1000000,
      gstRate: 0,
      gstAmount: 0,
      grossTotal: 1000000,
      tdsDeducted: 0,
      netPayable: 1000000,
      amountPaid: 1000000,
      balanceDue: 0,
      status: "paid",
      createdAt: "2026-10-01T08:00:00Z"
    },
    {
      id: "INV-2026-OCT-02",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      tenantId: "TEN-TECHNOVA",
      tenantName: "TechNova Solutions Pvt Ltd",
      invoiceNumber: "APX-INV-2026-OCT-02",
      fyYear: "2026-27",
      invoiceDate: "2026-10-01",
      dueDate: "2026-10-15",
      periodStart: "2026-10-01",
      periodEnd: "2026-10-31",
      invoiceType: "cam",
      baseRent: 0,
      camCharges: 150000,
      utilityCharges: 0,
      otherCharges: 0,
      subtotal: 150000,
      gstRate: 0,
      gstAmount: 0,
      grossTotal: 150000,
      tdsDeducted: 0,
      netPayable: 150000,
      amountPaid: 100000,
      balanceDue: 50000,
      status: "partially_paid",
      createdAt: "2026-10-01T08:00:00Z"
    },
    {
      id: "INV-2026-OCT-03",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      tenantId: "TEN-TECHNOVA",
      tenantName: "TechNova Solutions Pvt Ltd",
      invoiceNumber: "APX-INV-2026-OCT-03",
      fyYear: "2026-27",
      invoiceDate: "2026-10-01",
      dueDate: "2026-10-15",
      periodStart: "2026-10-01",
      periodEnd: "2026-10-31",
      invoiceType: "utility",
      baseRent: 0,
      camCharges: 0,
      utilityCharges: 85000,
      otherCharges: 0,
      subtotal: 85000,
      gstRate: 0,
      gstAmount: 0,
      grossTotal: 85000,
      tdsDeducted: 0,
      netPayable: 85000,
      amountPaid: 0,
      balanceDue: 85000,
      status: "issued",
      createdAt: "2026-10-01T08:00:00Z"
    },
    {
      id: "INV-2026-OCT-04",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      tenantId: "TEN-TECHNOVA",
      tenantName: "TechNova Solutions Pvt Ltd",
      invoiceNumber: "APX-INV-2026-OCT-04",
      fyYear: "2026-27",
      invoiceDate: "2026-10-01",
      dueDate: "2026-10-15",
      periodStart: "2026-10-01",
      periodEnd: "2026-10-31",
      invoiceType: "utility",
      baseRent: 0,
      camCharges: 0,
      utilityCharges: 15000,
      otherCharges: 0,
      subtotal: 15000,
      gstRate: 0,
      gstAmount: 0,
      grossTotal: 15000,
      tdsDeducted: 0,
      netPayable: 15000,
      amountPaid: 0,
      balanceDue: 15000,
      status: "issued",
      createdAt: "2026-10-01T08:00:00Z"
    },
    {
      id: "INV-2026-OCT-05",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      tenantId: "TEN-TECHNOVA",
      tenantName: "TechNova Solutions Pvt Ltd",
      invoiceNumber: "APX-INV-2026-OCT-05",
      fyYear: "2026-27",
      invoiceDate: "2026-10-01",
      dueDate: "2026-10-15",
      periodStart: "2026-10-01",
      periodEnd: "2026-10-31",
      invoiceType: "consolidated",
      baseRent: 0,
      camCharges: 0,
      utilityCharges: 0,
      otherCharges: 25000,
      subtotal: 25000,
      gstRate: 0,
      gstAmount: 0,
      grossTotal: 25000,
      tdsDeducted: 0,
      netPayable: 25000,
      amountPaid: 0,
      balanceDue: 25000,
      status: "issued",
      createdAt: "2026-10-01T08:00:00Z"
    },

    // September Invoices
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
    },
    {
      id: "INV-2026-904",
      orgId: org.id,
      billingEntityId: "BE-MTP-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-MTP-02",
      leaseCode: "MTP-L-0099",
      propertyId: "PROP-MTP",
      propertyName: "Meridian Tech Park",
      tenantId: "TEN-NEXTGEN",
      tenantName: "NextGen Retail Services Pvt Ltd",
      invoiceNumber: "MTP-INV-2026-0704",
      fyYear: "2026-27",
      invoiceDate: "2026-07-01",
      dueDate: "2026-07-15",
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      invoiceType: "consolidated",
      baseRent: 2024000,
      camCharges: 308000,
      utilityCharges: 0,
      otherCharges: 0,
      subtotal: 2332000,
      gstRate: 18,
      gstAmount: 419760,
      grossTotal: 2751760,
      tdsDeducted: 202400,
      netPayable: 2549360,
      amountPaid: 0,
      balanceDue: 2549360,
      status: "overdue",
      daysOverdue: 62,
      createdAt: "2026-07-01T08:00:00Z"
    },
    {
      id: "INV-2026-905",
      orgId: org.id,
      billingEntityId: "BE-NXN-01",
      clientAccountId: "CA-SHARMA",
      leaseId: "LEASE-NXN-01",
      leaseCode: "NX-L-0015",
      propertyId: "PROP-NXN",
      propertyName: "Nexus Hub",
      tenantId: "TEN-FRESHMART",
      tenantName: "FreshMart Retail Pvt Ltd",
      invoiceNumber: "NX-INV-2026-0905",
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-15",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      invoiceType: "consolidated",
      baseRent: 384000,
      camCharges: 43200,
      utilityCharges: 0,
      otherCharges: 0,
      subtotal: 427200,
      gstRate: 18,
      gstAmount: 76896,
      grossTotal: 504096,
      tdsDeducted: 38400,
      netPayable: 465696,
      amountPaid: 465696,
      balanceDue: 0,
      status: "paid",
      createdAt: "2026-09-01T08:00:00Z"
    },
    {
      id: "INV-2026-906",
      orgId: org.id,
      billingEntityId: "BE-FLX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-FLX-01",
      leaseCode: "BS-FLX-001",
      propertyId: "PROP-FLX",
      propertyName: "Brightspace Flex Centre",
      tenantId: "TEN-BRIGHTPATH",
      tenantName: "Brightpath Analytics Pvt Ltd",
      invoiceNumber: "BS-INV-2026-0906",
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-10",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      invoiceType: "rent",
      baseRent: 1230000,
      camCharges: 0,
      utilityCharges: 0,
      otherCharges: 0,
      subtotal: 1230000,
      gstRate: 18,
      gstAmount: 221400,
      grossTotal: 1451400,
      tdsDeducted: 123000,
      netPayable: 1328400,
      amountPaid: 1328400,
      balanceDue: 0,
      status: "paid",
      createdAt: "2026-09-01T08:00:00Z"
    },
    {
      id: "INV-2026-907",
      orgId: org.id,
      billingEntityId: "BE-FLX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-FLX-02",
      leaseCode: "BS-FLX-002",
      propertyId: "PROP-FLX",
      propertyName: "Brightspace Flex Centre",
      tenantId: "TEN-NIMBUS",
      tenantName: "Nimbus Labs Pvt Ltd",
      invoiceNumber: "BS-INV-2026-0907",
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-10",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      invoiceType: "rent",
      baseRent: 690000,
      camCharges: 0,
      utilityCharges: 0,
      otherCharges: 0,
      subtotal: 690000,
      gstRate: 18,
      gstAmount: 124200,
      grossTotal: 814200,
      tdsDeducted: 69000,
      netPayable: 745200,
      amountPaid: 745200,
      balanceDue: 0,
      status: "paid",
      createdAt: "2026-09-01T08:00:00Z"
    },
    {
      id: "INV-2026-908",
      orgId: org.id,
      billingEntityId: "BE-FLX-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-FLX-03",
      leaseCode: "BS-FLX-003",
      propertyId: "PROP-FLX",
      propertyName: "Brightspace Flex Centre",
      tenantId: "TEN-VERITAS",
      tenantName: "Veritas Legal LLP",
      invoiceNumber: "BS-INV-2026-0908",
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-10",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      invoiceType: "rent",
      baseRent: 420000,
      camCharges: 0,
      utilityCharges: 0,
      otherCharges: 0,
      subtotal: 420000,
      gstRate: 18,
      gstAmount: 75600,
      grossTotal: 495600,
      tdsDeducted: 42000,
      netPayable: 453600,
      amountPaid: 453600,
      balanceDue: 0,
      status: "paid",
      createdAt: "2026-09-01T08:00:00Z"
    },
    {
      id: "INV-2026-909",
      orgId: org.id,
      billingEntityId: "BE-GFT-01",
      clientAccountId: "CA-SELF",
      leaseId: "LEASE-GFT-01",
      leaseCode: "GFT-L-0005",
      propertyId: "PROP-GIFT",
      propertyName: "GIFT Tower One IFSC",
      tenantId: "TEN-AURUM",
      tenantName: "Aurum Global Fund Services IFSC Pvt Ltd",
      invoiceNumber: "GFT-INV-2026-0909",
      fyYear: "2026-27",
      invoiceDate: "2026-09-01",
      dueDate: "2026-09-15",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      invoiceType: "rent",
      baseRent: 630000,
      currency: "USD",
      fxRate: 84,
      originalAmount: 7500,
      reportingAmountInr: 630000,
      camCharges: 0,
      utilityCharges: 0,
      otherCharges: 0,
      subtotal: 630000,
      gstRate: 0, // IFSC SEZ Zero-rated
      gstAmount: 0,
      grossTotal: 630000,
      tdsDeducted: 0,
      netPayable: 630000,
      amountPaid: 630000,
      balanceDue: 0,
      status: "paid",
      createdAt: "2026-09-01T08:00:00Z"
    }
  ];

  const billingRuns: BillingRunEntity[] = [
    {
      id: "RUN-2026-09",
      orgId: org.id,
      billingEntityId: "BE-APX-01",
      periodMonth: "2026-09",
      totalContracts: 10,
      totalInvoicesGenerated: 9,
      grossBilledAmount: 16194200,
      totalGstAmount: 1890000,
      status: "issued",
      createdAt: "2026-09-01T08:00:00Z"
    }
  ];

  const collections: CollectionEntity[] = [
    // Table 98 Worked Example: Multi-Invoice Payment of 11,00,000 for TechNova
    {
      id: "COL-2026-OCT-01",
      orgId: org.id,
      invoiceId: "INV-2026-OCT-01",
      invoiceNumber: "APX-INV-2026-OCT-01",
      leaseId: "LEASE-APX-01",
      leaseCode: "APX-L-0042",
      tenantId: "TEN-TECHNOVA",
      tenantName: "TechNova Solutions Pvt Ltd",
      propertyName: "Apex Business Tower",
      receiptNumber: "REC-APX-2026-OCT-01",
      paymentDate: "2026-10-05",
      paymentMode: "neft_rtgs",
      referenceNumber: "HDFCR520261005998811",
      amountReceived: 1100000,
      tdsDeducted: 0,
      bankCharges: 0,
      netCredited: 1100000,
      bankAccount: "HDFC BKC 50200088991122",
      notes: "Multi-invoice payment allocated across Oct Rent & CAM per Table 98",
      createdAt: "2026-10-05T11:00:00Z"
    },
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
    },
    {
      id: "COL-2026-003",
      orgId: org.id,
      invoiceId: "INV-2026-906",
      invoiceNumber: "BS-INV-2026-0906",
      leaseId: "LEASE-FLX-01",
      leaseCode: "BS-FLX-001",
      tenantId: "TEN-BRIGHTPATH",
      tenantName: "Brightpath Analytics Pvt Ltd",
      propertyName: "Brightspace Flex Centre",
      receiptNumber: "REC-BS-2026-003",
      paymentDate: "2026-09-05",
      paymentMode: "neft_rtgs",
      referenceNumber: "KKBKR520260905443322",
      amountReceived: 1328400,
      tdsDeducted: 123000,
      bankCharges: 0,
      netCredited: 1328400,
      bankAccount: "Kotak Mahindra Sector 44 8012345678",
      notes: "Monthly seat fee settlement.",
      createdAt: "2026-09-05T12:00:00Z"
    }
  ];

  const paymentAllocations: PaymentAllocationEntity[] = [
    // Table 98 Allocations for TechNova payment of 11,00,000
    {
      id: "ALLOC-OCT-01",
      paymentId: "COL-2026-OCT-01",
      invoiceId: "INV-2026-OCT-01",
      allocatedGst: 0,
      allocatedBaseRent: 1000000,
      allocatedCam: 0,
      allocatedOther: 0,
      totalAllocated: 1000000,
      allocatedAt: "2026-10-05T11:00:00Z"
    },
    {
      id: "ALLOC-OCT-02",
      paymentId: "COL-2026-OCT-01",
      invoiceId: "INV-2026-OCT-02",
      allocatedGst: 0,
      allocatedBaseRent: 0,
      allocatedCam: 100000,
      allocatedOther: 0,
      totalAllocated: 100000,
      allocatedAt: "2026-10-05T11:00:00Z"
    },
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

  // Table 104 Owner Statement (October 2026, Sharma Family Trust)
  const ownerStatements: OwnerStatementEntity[] = [
    {
      id: "STMT-SHARMA-2026-10",
      orgId: org.id,
      clientAccountId: "CA-SHARMA",
      clientAccountName: "Sharma Family Office Asset Trust",
      statementNumber: "STMT-SHARMA-2026-10",
      periodMonth: "2026-10",
      grossBilled: 5200000,
      totalCollected: 4800000,
      totalArrears: 400000,
      operatorManagementFee: 192000, // 4% of 48L (Formula F-20)
      reimbursableExpenses: 120000,
      netRemittanceAmount: 4453440, // 48L - 1.92L fee - 34,560 GST - 1.2L expenses (F-21)
      remittanceStatus: "remitted",
      remittanceDate: "2026-10-10",
      remittanceUtr: "AXISR520261010998877",
      issuedAt: "2026-10-07T10:00:00Z"
    },
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
      operatorManagementFee: 61360,
      reimbursableExpenses: 12500,
      netRemittanceAmount: 1449095,
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

  // Table 102 & 103 Brightspace Flex Centre
  const flexCentres: FlexCentreEntity[] = [
    {
      id: "FLX-BRIGHTSPACE-01",
      orgId: org.id,
      centreName: "Brightspace Flex, Sector 44",
      propertyId: "PROP-FLX",
      propertyName: "Brightspace Flex Centre",
      totalAreaSqft: 18000,
      seatCapacity: 240,
      headLeaseCode: "HL-SEC44-01",
      headLeaseMonthlyRent: 1710000, // 18,000 sq ft @ 95/sqft (Section 13.7)
      headLeaseCamMonthly: 270000,  // 18,000 sq ft @ 15/sqft
      landlordName: "Meridian Cyber Parks Development LLP",
      directOpexMonthly: 600000, // staff, utilities, housekeeping, internet
      directOpexBreakdown: {
        staffPayroll: 250000,
        utilitiesPower: 180000,
        housekeepingSupplies: 100000,
        highSpeedInternet: 70000
      },
      meetingRoomHourlyRate: 800,
      meetingRoomHoursBilled: 42, // 33,600
      parkingSlotRate: 4000,
      parkingSlotsBilled: 12, // 48,000
      members: [
        {
          id: "MBR-01",
          memberName: "Brightpath Analytics Pvt Ltd",
          planName: "Enterprise Cabin",
          billingBasis: "minimum_commitment",
          contractedSeats: 100,
          minimumSeats: 80,
          occupiedSeats: 82,
          ratePerSeat: 15000,
          billableSeats: 82,
          monthlyAmount: 1230000
        },
        {
          id: "MBR-02",
          memberName: "Nimbus Labs Pvt Ltd",
          planName: "Premium Dedicated Seat",
          billingBasis: "contracted",
          contractedSeats: 60,
          minimumSeats: 0,
          occupiedSeats: 55,
          ratePerSeat: 11500,
          billableSeats: 60,
          monthlyAmount: 690000
        },
        {
          id: "MBR-03",
          memberName: "Hot Desk Enterprise Members Pool",
          planName: "Hot Desk",
          billingBasis: "occupied",
          contractedSeats: 40,
          minimumSeats: 0,
          occupiedSeats: 30,
          ratePerSeat: 7500,
          billableSeats: 30,
          monthlyAmount: 225000
        },
        {
          id: "MBR-04",
          memberName: "Veritas Legal LLP",
          planName: "Team Room (Hybrid)",
          billingBasis: "hybrid",
          contractedSeats: 35,
          minimumSeats: 25,
          occupiedSeats: 35,
          ratePerSeat: 12000,
          billableSeats: 35,
          monthlyAmount: 420000
        },
        {
          id: "MBR-05",
          memberName: "Virtual Office Member Network",
          planName: "Virtual Office",
          billingBasis: "contracted",
          contractedSeats: 30,
          minimumSeats: 0,
          occupiedSeats: 0,
          ratePerSeat: 2500,
          billableSeats: 30,
          monthlyAmount: 75000
        }
      ],
      createdAt: "2026-04-01T00:00:00Z"
    }
  ];

  const camPools: CamPoolEntity[] = [
    {
      id: "POOL-APX-2026",
      orgId: org.id,
      propertyId: "PROP-APX",
      propertyName: "Apex Business Tower",
      fyYear: "2026-27",
      totalBuildingArea: 98400,
      provisionalRatePsfMonth: 28,
      annualBudgetTotal: 42000000,
      actualCostTotal: 43500000,
      categories: [
        { category: "security", categoryName: "Round-the-Clock Physical & Electronic Security", annualBudget: 11000000, actualCostYtd: 11500000 },
        { category: "mep_hvac", categoryName: "Central Chillers & MEP Maintenance", annualBudget: 12000000, actualCostYtd: 12800000 },
        { category: "common_electricity", categoryName: "Common Area & Basement HT Electricity", annualBudget: 9000000, actualCostYtd: 9100000 },
        { category: "housekeeping", categoryName: "Facade Cleaning & Janitorial Operations", annualBudget: 5000000, actualCostYtd: 4900000 },
        { category: "lifts", categoryName: "Otis High-Speed Lifts AMC & Inspection", annualBudget: 3000000, actualCostYtd: 3100000 },
        { category: "water_sanitation", categoryName: "STP Plant, Water Supply & Fire Safety AMC", annualBudget: 2000000, actualCostYtd: 2100000 }
      ],
      trueUpStatus: "draft",
      createdAt: "2026-04-01T00:00:00Z"
    },
    {
      id: "POOL-MTP-2026",
      orgId: org.id,
      propertyId: "PROP-MTP",
      propertyName: "Meridian Tech Park",
      fyYear: "2026-27",
      totalBuildingArea: 110000,
      provisionalRatePsfMonth: 14,
      annualBudgetTotal: 38000000, // 3.80 Cr budget (Document Section 13)
      actualCostTotal: 39500000,
      categories: [
        { category: "security", categoryName: "Campus Gate & Perimeter Security", annualBudget: 12000000, actualCostYtd: 11800000 },
        { category: "mep_hvac", categoryName: "HVAC Plant & Substation AMC", annualBudget: 15000000, actualCostYtd: 14700000 },
        { category: "common_electricity", categoryName: "Campus Lighting & Pump Rooms", annualBudget: 7000000, actualCostYtd: 6900000 },
        { category: "housekeeping", categoryName: "Campus Roadways & Atrium Housekeeping", annualBudget: 5000000, actualCostYtd: 4900000 },
        { category: "landscaping", categoryName: "Horticulture & Green Zone Maintenance", annualBudget: 3000000, actualCostYtd: 2900000 }
      ],
      trueUpStatus: "draft",
      createdAt: "2026-04-01T00:00:00Z"
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
    flexCentres,
    camPools,
    meterReadings: [
      {
        id: "MTR-APX-01",
        orgId: org.id,
        propertyId: "PROP-APX",
        propertyName: "Apex Business Tower",
        spaceId: "SPC-APX-05A",
        unitNumber: "APX-05A",
        tenantId: "TEN-TECHNOVA",
        tenantName: "TechNova Solutions Pvt Ltd",
        meterType: "electricity_grid",
        meterNumber: "EB-MUM-401-A",
        readingDate: "2026-09-30",
        periodMonth: "2026-09",
        previousReading: 184220,
        currentReading: 196410,
        multiplier: 1,
        consumption: 12190,
        tariffPerUnit: 11.50,
        totalCharge: 140185,
        status: "approved",
        createdAt: "2026-09-30T10:00:00Z"
      },
      {
        id: "MTR-APX-02",
        orgId: org.id,
        propertyId: "PROP-APX",
        propertyName: "Apex Business Tower",
        spaceId: "SPC-APX-05A",
        unitNumber: "APX-05A",
        tenantId: "TEN-TECHNOVA",
        tenantName: "TechNova Solutions Pvt Ltd",
        meterType: "electricity_dg",
        meterNumber: "DG-MUM-401-B",
        readingDate: "2026-09-30",
        periodMonth: "2026-09",
        previousReading: 1240,
        currentReading: 1420,
        multiplier: 1,
        consumption: 180,
        tariffPerUnit: 32.00,
        totalCharge: 5760,
        status: "approved",
        createdAt: "2026-09-30T10:00:00Z"
      },
      {
        id: "MTR-MTP-01",
        orgId: org.id,
        propertyId: "PROP-MTP",
        propertyName: "Meridian Tech Park",
        spaceId: "SPC-MTP-01",
        unitNumber: "MTP-T1-03",
        tenantId: "TEN-INNOVATE",
        tenantName: "Innovate Corp Technologies Pvt Ltd",
        meterType: "electricity_grid",
        meterNumber: "EB-DEL-201-A",
        readingDate: "2026-09-30",
        periodMonth: "2026-09",
        previousReading: 89100,
        currentReading: 94600,
        multiplier: 1,
        consumption: 5500,
        tariffPerUnit: 10.80,
        totalCharge: 59400,
        status: "approved",
        createdAt: "2026-09-30T10:00:00Z"
      }
    ],
    chargeMaster: [
      {
        id: "CHG-RENT",
        chargeName: "Monthly Base Rent",
        chargeCode: "BASE_RENT",
        chargeType: "rent",
        billingBasis: "psf_monthly",
        defaultRate: 150,
        gstRate: 18,
        tdsApplicable: true,
        tdsRate: 10,
        hsnSacCode: "997212",
        description: "Standard commercial office space lease base rental"
      },
      {
        id: "CHG-CAM",
        chargeName: "Common Area Maintenance (CAM)",
        chargeCode: "CAM_PROVISIONAL",
        chargeType: "cam",
        billingBasis: "psf_monthly",
        defaultRate: 28,
        gstRate: 18,
        tdsApplicable: false,
        tdsRate: 0,
        hsnSacCode: "998599",
        description: "Comprehensive facility, security, HVAC, lifts and upkeep maintenance"
      },
      {
        id: "CHG-EB-GRID",
        chargeName: "Grid Power Consumption",
        chargeCode: "EB_GRID",
        chargeType: "utility",
        billingBasis: "metered",
        defaultRate: 11.50,
        gstRate: 18,
        tdsApplicable: false,
        tdsRate: 0,
        hsnSacCode: "998631",
        description: "State utility HT electricity meter consumption charge"
      },
      {
        id: "CHG-EB-DG",
        chargeName: "DG Backup Power Consumption",
        chargeCode: "EB_DG",
        chargeType: "utility",
        billingBasis: "metered",
        defaultRate: 32.00,
        gstRate: 18,
        tdsApplicable: false,
        tdsRate: 0,
        hsnSacCode: "998631",
        description: "Diesel Generator captive backup power supply charge per kWh"
      },
      {
        id: "CHG-PARKING",
        chargeName: "Reserved Basement Car Parking",
        chargeCode: "PARKING_RESERVED",
        chargeType: "parking",
        billingBasis: "fixed_monthly",
        defaultRate: 4500,
        gstRate: 18,
        tdsApplicable: false,
        tdsRate: 0,
        hsnSacCode: "996729",
        description: "Allotted reserved basement / stilt vehicular parking slots"
      }
    ],
    config: {
      leaseExpiryAlertDays: 90,
      escalationAlertDays: 30,
      defaultGstPct: 18,
      defaultPaymentDueDays: 15,
      currency: "INR",
      asOfDate: "2026-09-30",
      makerCheckerEnabled: true,
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
    flexCentres: [],
    camPools: [],
    meterReadings: [],
    chargeMaster: [],
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

// Auto-hydrate spaces and contracts for any registered property lacking space inventory (Disabled: clean user workspace)
export function ensureSpacesAndContractsForProperties(parsed: RentRollDatabase): boolean {
  return false;
}

// Read database with memory caching and serverless safety
export function getRentRollDb(): RentRollDatabase {
  if (memoryDbInstance) {
    return memoryDbInstance;
  }

  ensureDataDir();
  let parsed: any = null;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      parsed = JSON.parse(raw);
    } catch {
      // Fallback
    }
  }

  if (!parsed && fs.existsSync(SEED_DB_FILE)) {
    try {
      const raw = fs.readFileSync(SEED_DB_FILE, 'utf8');
      parsed = JSON.parse(raw);
    } catch {
      // Fallback
    }
  }

  if (!parsed) {
    parsed = getEmptyDatabase();
  }

  try {
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
    if (!parsed.flexCentres) parsed.flexCentres = [];
    if (!parsed.camPools) parsed.camPools = [];
    if (!parsed.meterReadings) parsed.meterReadings = [];
    if (!parsed.auditLogs) parsed.auditLogs = [];

    if (!parsed.snapshots) parsed.snapshots = [];
    if (!parsed.spaces) parsed.spaces = [];
    if (!parsed.leases) parsed.leases = [];
    if (!parsed.tenants) parsed.tenants = [];
    if (!parsed.properties) parsed.properties = [];
    if (!parsed.invoices) parsed.invoices = [];
    if (!parsed.collections) parsed.collections = [];
    if (!parsed.expenses) parsed.expenses = [];
    if (!parsed.notices) parsed.notices = [];
    if (!parsed.alerts) parsed.alerts = [];
    if (!parsed.escalations) parsed.escalations = [];

    if (!parsed.chargeMaster || parsed.chargeMaster.length === 0) {
      parsed.chargeMaster = getEmptyDatabase().chargeMaster;
    }

    if (!parsed.config) {
      parsed.config = getEmptyDatabase().config;
    } else if (parsed.config.makerCheckerEnabled === undefined) {
      parsed.config.makerCheckerEnabled = true;
    }

    memoryDbInstance = parsed;

    // Trigger async cloud hydration check from Supabase PostgreSQL
    fetchDbFromCloud().then(cloudDb => {
      if (cloudDb && cloudDb.properties) {
        memoryDbInstance = cloudDb;
      }
    }).catch(() => {});

    return memoryDbInstance as RentRollDatabase;
  } catch (e) {
    console.error("Error reading rent roll DB, initializing clean empty DB:", e);
    const initial = getEmptyDatabase();
    memoryDbInstance = initial;
    return initial;
  }
}

// Reset DB to clean empty state or reload seed fixtures
export function resetRentRollDb(mode: "clean" | "fixtures" = "clean"): RentRollDatabase {
  ensureDataDir();
  const db = mode === "clean" ? getEmptyDatabase() : getInitialSeedDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  return db;
}

// Flex Centre Store Methods
export function getFlexCentres(): FlexCentreEntity[] {
  const db = getRentRollDb();
  return db.flexCentres || [];
}

export function updateFlexCentre(id: string, patch: Partial<FlexCentreEntity>): FlexCentreEntity | null {
  const db = getRentRollDb();
  const index = (db.flexCentres || []).findIndex(fc => fc.id === id);
  if (index === -1) return null;
  db.flexCentres[index] = { ...db.flexCentres[index], ...patch };
  saveRentRollDb(db);
  return db.flexCentres[index];
}

// CAM Pools Store Methods
export function getCamPools(propertyId?: string): CamPoolEntity[] {
  const db = getRentRollDb();
  if (propertyId && propertyId !== "ALL") {
    return (db.camPools || []).filter(cp => cp.propertyId === propertyId);
  }
  return db.camPools || [];
}

export function executeCamTrueUpInStore(poolId: string): { summary: any; adjustmentNotes: AdjustmentNoteEntity[] } {
  const db = getRentRollDb();
  const pool = (db.camPools || []).find(p => p.id === poolId);
  if (!pool) throw new Error("CAM Pool not found");

  // Get active leases in this property
  const activeLeases = (db.leases || []).filter(l => l.propertyId === pool.propertyId && l.status === "active");
  const tenantsInput = activeLeases.map(l => ({
    tenantId: l.tenantId,
    tenantName: l.tenantName,
    unitNumber: l.unitNumber,
    chargeableArea: l.chargeableArea,
    advanceCamBilled: round2((l.camMonthly || 0) * 12)
  }));

  const { calculateCamPoolTrueUp } = require('./rent-roll-engine');
  const summary = calculateCamPoolTrueUp(
    pool.propertyId,
    pool.propertyName,
    pool.fyYear,
    pool.totalBuildingArea,
    pool.actualCostTotal,
    tenantsInput
  );

  const createdNotes: AdjustmentNoteEntity[] = [];

  summary.tenantResults.forEach((tr: any) => {
    if (tr.action !== "SETTLED" && tr.noteAmount > 0) {
      const noteType = tr.action === "DEBIT_NOTE" ? "debit_note" : "credit_note";
      const gstAmount = round2(tr.noteAmount * 0.18);
      const totalAdjustment = round2(tr.noteAmount + gstAmount);
      const noteNumber = `${tr.action === "DEBIT_NOTE" ? "DN" : "CN"}-${pool.fyYear}-${Date.now().toString().slice(-4)}`;
      
      const newNote: AdjustmentNoteEntity = {
        id: `ADJ-CAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orgId: db.organization.id,
        invoiceId: `CAM-TRUEUP-${pool.id}`,
        noteType,
        noteNumber,
        reason: `CAM Year-End True-Up FY ${pool.fyYear} (${tr.tenantName} - Unit ${tr.unitNumber})`,
        amount: tr.noteAmount,
        gstAmount,
        totalAdjustment,
        issuedDate: new Date().toISOString().split("T")[0],
        status: "applied",
        createdAt: new Date().toISOString()
      };

      db.adjustmentNotes.unshift(newNote);
      createdNotes.push(newNote);
    }
  });

  pool.trueUpStatus = "executed";
  pool.lastTrueUpDate = new Date().toISOString().split("T")[0];
  saveRentRollDb(db);

  return { summary, adjustmentNotes: createdNotes };
}

// Dispute Invoice
export function disputeInvoiceInStore(
  invoiceId: string,
  reason: string,
  disputeAmount: number,
  disputeRemark: string
): InvoiceEntity {
  const db = getRentRollDb();
  const invoice = (db.invoices || []).find(i => i.id === invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  invoice.status = "disputed";
  invoice.isDisputed = true;
  invoice.disputeReason = reason;
  invoice.disputeAmount = disputeAmount;
  invoice.disputeRemark = disputeRemark;
  invoice.disputedAt = new Date().toISOString();

  // Create alert
  db.alerts.unshift({
    id: `ALT-DISP-${Date.now()}`,
    orgId: db.organization.id,
    alertType: "invoice_dispute",
    title: `Invoice Disputed by ${invoice.tenantName}`,
    message: `Tenant raised dispute on ${invoice.invoiceNumber} (₹${disputeAmount.toLocaleString('en-IN')}). Reason: ${reason}`,
    entityType: "invoice",
    entityId: invoice.id,
    severity: "warning",
    isRead: false,
    triggerDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString()
  });

  saveRentRollDb(db);
  return invoice;
}

// Razorpay Payment Simulation & Sub-ledger Allocation
export function processRazorpayCheckoutInStore(params: {
  invoiceIds: string[];
  tenantId: string;
  tenantName: string;
  amountPaid: number;
  paymentMode: "neft_rtgs" | "upi" | "cheque" | "ach" | "credit_card";
  paymentReference?: string;
}): { receipt: CollectionEntity; allocations: PaymentAllocationEntity[]; updatedInvoices: InvoiceEntity[] } {
  const db = getRentRollDb();
  const { allocatePaymentToInvoice } = require('./rent-roll-engine');

  const refNumber = params.paymentReference || `RZP_${Date.now().toString().slice(-8)}`;
  const receiptNumber = `REC-RZP-${Date.now().toString().slice(-6)}`;
  const paymentDate = new Date().toISOString().split("T")[0];

  const receipt: CollectionEntity = {
    id: `COL-RZP-${Date.now()}`,
    orgId: db.organization.id,
    invoiceId: params.invoiceIds[0] || "",
    invoiceNumber: params.invoiceIds.join(", "),
    leaseId: "",
    leaseCode: "",
    tenantId: params.tenantId,
    tenantName: params.tenantName,
    propertyName: "Apex Business Tower",
    receiptNumber,
    paymentDate,
    paymentMode: params.paymentMode,
    referenceNumber: refNumber,
    amountReceived: params.amountPaid,
    tdsDeducted: 0,
    bankCharges: 0,
    netCredited: params.amountPaid,
    bankAccount: "HDFC Escrow A/c - Razorpay Gateway",
    notes: `Online Checkout settlement via ${params.paymentMode}`,
    createdAt: new Date().toISOString()
  };

  db.collections.unshift(receipt);

  let unallocated = params.amountPaid;
  const allocations: PaymentAllocationEntity[] = [];
  const updatedInvoices: InvoiceEntity[] = [];

  for (const invId of params.invoiceIds) {
    if (unallocated <= 0) break;
    const inv = db.invoices.find(i => i.id === invId);
    if (!inv || inv.balanceDue <= 0) continue;

    receipt.leaseId = inv.leaseId;
    receipt.leaseCode = inv.leaseCode;
    receipt.propertyName = inv.propertyName;
    receipt.propertyId = inv.propertyId;

    const allocation = allocatePaymentToInvoice(unallocated, {
      baseRent: inv.baseRent,
      camCharges: inv.camCharges,
      gstAmount: inv.gstAmount,
      otherCharges: inv.otherCharges,
      balanceDue: inv.balanceDue
    });

    const allocEntity: PaymentAllocationEntity = {
      id: `ALLOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentId: receipt.id,
      invoiceId: inv.id,
      allocatedBaseRent: allocation.allocatedBaseRent,
      allocatedCam: allocation.allocatedCam,
      allocatedGst: allocation.allocatedGst,
      allocatedOther: allocation.allocatedOther,
      totalAllocated: allocation.totalAllocated,
      allocatedAt: new Date().toISOString()
    };
    db.paymentAllocations.unshift(allocEntity);
    allocations.push(allocEntity);

    inv.amountPaid = round2(inv.amountPaid + allocation.totalAllocated);
    inv.balanceDue = round2(Math.max(0, inv.balanceDue - allocation.totalAllocated));
    inv.status = inv.balanceDue === 0 ? "paid" : "partially_paid";
    inv.paidDate = paymentDate;
    inv.paymentMode = params.paymentMode;
    inv.referenceNumber = refNumber;
    updatedInvoices.push(inv);

    unallocated -= allocation.totalAllocated;
  }

  saveRentRollDb(db);
  return { receipt, allocations, updatedInvoices };
}


// Save database with persistent write-through and cloud backup
export function saveRentRollDb(db: RentRollDatabase): void {
  memoryDbInstance = db;
  ensureDataDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.warn('[STORE] Local file write warning (cached in memory):', err);
  }
  // Asynchronously persist to Supabase PostgreSQL for cross-deployment permanence
  persistDbToCloud(db).catch(err => {
    console.warn('[STORE] Cloud persistence notice:', err);
  });
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

// Snapshot Freezing & Retrieval (§4.12, RR-AUD-03)
export function getRentRollSnapshots(propertyId?: string): RentRollSnapshotEntity[] {
  const db = getRentRollDb();
  const snaps = db.snapshots || [];
  if (propertyId && propertyId !== "ALL") {
    return snaps.filter(s => !s.propertyId || s.propertyId === propertyId);
  }
  return snaps;
}

export function freezeMonthEndSnapshot(params: {
  snapshotMonth: string; // e.g. "2026-09"
  asOfDate: string; // e.g. "2026-09-30"
  propertyId?: string;
  frozenBy?: string;
}): RentRollSnapshotEntity {
  const db = getRentRollDb();
  if (!db.snapshots) db.snapshots = [];

  const targetProp = params.propertyId && params.propertyId !== "ALL"
    ? db.properties.find(p => p.id === params.propertyId)
    : undefined;

  const relevantSpaces = targetProp
    ? db.spaces.filter(s => s.propertyId === targetProp.id)
    : db.spaces;

  const relevantLeases = targetProp
    ? db.leases.filter(l => l.propertyId === targetProp.id)
    : db.leases;

  let totalArea = 0;
  let occupiedArea = 0;
  let vacantArea = 0;
  let totalBaseRent = 0;
  let totalCam = 0;
  let occupiedSpaces = 0;
  let vacantSpaces = 0;

  const lines: RentRollSnapshotLine[] = relevantSpaces.map(sp => {
    totalArea += sp.chargeableArea;
    const activeLease = relevantLeases.find(l => 
      (l.spaceId === sp.id || (l.spacesCovered && l.spacesCovered.some(sc => sc.spaceId === sp.id))) &&
      l.startDate <= params.asOfDate && l.endDate >= params.asOfDate &&
      (l.status === "active" || l.status === "under_notice")
    );

    if (activeLease) {
      occupiedArea += sp.chargeableArea;
      totalBaseRent += activeLease.monthlyRent;
      totalCam += activeLease.camMonthly;
      occupiedSpaces++;

      return {
        spaceId: sp.id,
        unitNumber: sp.unitNumber,
        floorNumber: sp.floorNumber,
        areaSqft: sp.chargeableArea,
        status: "occupied" as const,
        tenantName: activeLease.tenantName,
        contractCode: activeLease.leaseCode,
        contractType: activeLease.contractType || "lease_deed",
        monthlyRent: activeLease.monthlyRent,
        baseRentPsf: activeLease.baseRentPsf,
        camRatePsf: activeLease.camRatePsf,
        leaseStartDate: activeLease.startDate,
        leaseEndDate: activeLease.endDate,
        escalationPct: activeLease.escalationPct,
        securityDeposit: activeLease.securityDepositAmount
      };
    } else {
      vacantArea += sp.chargeableArea;
      vacantSpaces++;

      return {
        spaceId: sp.id,
        unitNumber: sp.unitNumber,
        floorNumber: sp.floorNumber,
        areaSqft: sp.chargeableArea,
        status: "vacant" as const,
        baseRentPsf: sp.standardMarketRentPsf || sp.standardRatePsf,
        camRatePsf: sp.standardCamPsf
      };
    }
  });

  const occupancyPct = totalArea > 0 ? Math.round((occupiedArea / totalArea) * 1000) / 10 : 0;
  const snapshot: RentRollSnapshotEntity = {
    id: `SNAP-${params.snapshotMonth}-${targetProp ? targetProp.id.slice(-4) : "ALL"}`,
    orgId: db.organization.id,
    snapshotMonth: params.snapshotMonth,
    asOfDate: params.asOfDate,
    propertyId: targetProp?.id,
    propertyName: targetProp?.name || "Consolidated Portfolio",
    totalArea,
    occupiedArea,
    vacantArea,
    occupancyPct,
    totalMonthlyGross: totalBaseRent + totalCam,
    totalBaseRent,
    totalCam,
    totalSpaces: relevantSpaces.length,
    occupiedSpaces,
    vacantSpaces,
    waltYears: 3.8,
    status: "frozen",
    frozenAt: new Date().toISOString(),
    frozenBy: params.frozenBy || "Finance Controller",
    lines,
    createdAt: new Date().toISOString()
  };

  // Upsert snapshot for this month & property (RR-AUD-03, UAT-59)
  const existing = (db.snapshots || []).find(s => s.id === snapshot.id);
  if (existing && existing.isLocked) {
    throw new Error(`Snapshot for month ${params.snapshotMonth} is locked and immutable. Corrections must be applied via adjustment notes (RR-AUD-03, UAT-59).`);
  }

  db.snapshots = db.snapshots.filter(s => s.id !== snapshot.id);
  db.snapshots.unshift(snapshot);
  saveRentRollDb(db);

  recordAuditLog({
    entityName: "RentRollSnapshot",
    action: "FREEZE_MONTH_END_SNAPSHOT",
    newValues: {
      snapshotId: snapshot.id,
      month: params.snapshotMonth,
      totalArea,
      occupancyPct,
      grossMonthly: snapshot.totalMonthlyGross
    },
    changedBy: params.frozenBy || "Finance Controller"
  });

  return snapshot;
}

export function lockMonthEndSnapshot(snapshotId: string, lockedBy: string = "Commercial Auditor"): RentRollSnapshotEntity {
  const db = getRentRollDb();
  if (!db.snapshots) db.snapshots = [];
  const target = db.snapshots.find(s => s.id === snapshotId);
  if (!target) {
    throw new Error(`Snapshot ${snapshotId} not found.`);
  }
  target.isLocked = true;
  target.lockedAt = new Date().toISOString();
  target.lockedBy = lockedBy;
  saveRentRollDb(db);

  recordAuditLog({
    entityName: "RentRollSnapshot",
    action: "LOCK_SNAPSHOT",
    newValues: { snapshotId, lockedBy, lockedAt: target.lockedAt },
    changedBy: lockedBy
  });

  return target;
}

export function addContractDocumentVersion(params: {
  leaseId: string;
  documentType: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  uploadedBy?: string;
  isExecuted?: boolean;
}): { document: ContractDocumentEntity; lease: LeaseEntity } {
  const db = getRentRollDb();
  const lease = db.leases.find(l => l.id === params.leaseId || l.leaseCode === params.leaseId);
  if (!lease) {
    throw new Error(`Contract ${params.leaseId} not found`);
  }
  if (!lease.documents) lease.documents = [];

  // Supercede existing documents of same type (UAT-23)
  const sameTypeDocs = lease.documents.filter(d => d.documentType === params.documentType);
  let nextVersion = 1;
  if (sameTypeDocs.length > 0) {
    sameTypeDocs.forEach(d => {
      d.isCurrent = false;
      d.status = "superseded";
    });
    const maxVer = Math.max(...sameTypeDocs.map(d => d.versionNumber || 1));
    nextVersion = maxVer + 1;
  }

  const newDoc: ContractDocumentEntity = {
    id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    contractId: lease.id,
    documentType: params.documentType,
    title: params.title || params.fileName,
    versionNumber: nextVersion,
    fileName: params.fileName,
    fileUrl: params.fileUrl,
    fileSizeBytes: params.fileSizeBytes || 102400,
    status: params.isExecuted ? "executed" : "draft",
    isExecuted: !!params.isExecuted,
    isCurrent: true,
    uploadedBy: params.uploadedBy || "Commercial Executive",
    createdAt: new Date().toISOString()
  };

  lease.documents.unshift(newDoc);
  saveRentRollDb(db);

  recordAuditLog({
    leaseId: lease.id,
    entityName: "ContractDocument",
    action: "UPLOAD_DOCUMENT_VERSION",
    newValues: {
      contractCode: lease.leaseCode,
      documentType: params.documentType,
      version: nextVersion,
      fileName: params.fileName
    },
    changedBy: params.uploadedBy || "Commercial Executive"
  });

  return { document: newDoc, lease };
}


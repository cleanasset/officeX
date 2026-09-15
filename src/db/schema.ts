import { pgTable, pgEnum, uuid, varchar, text, decimal, integer, timestamp, date, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Existing & Shared Enums
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "property_manager",
  "facility_manager",
  "tenant_admin",
  "vendor_admin",
  "broker",
  "auditor"
]);

export const propertyGradeEnum = pgEnum("property_grade", ["A", "B", "C", "A+", "B+"]);
export const unitStatusEnum = pgEnum("unit_status", ["available", "leased", "in_negotiation", "under_fitout", "maintenance"]);
export const rfqStatusEnum = pgEnum("rfq_status", ["open", "evaluating", "awarded", "closed"]);
export const quoteStatusEnum = pgEnum("quote_status", ["submitted", "shortlisted", "awarded", "declined"]);
export const woStatusEnum = pgEnum("wo_status", ["issued", "accepted", "in_progress", "completed"]);

// Rent Roll Specific Enums
export const leaseStatusEnum = pgEnum("lease_status", [
  "draft",
  "active",
  "under_notice",
  "expired",
  "terminated",
  "holdover"
]);

export const renewalStatusEnum = pgEnum("renewal_status", [
  "not_due",
  "approaching",
  "under_negotiation",
  "renewed",
  "vacating"
]);

export const billingFrequencyEnum = pgEnum("billing_frequency", [
  "monthly",
  "quarterly",
  "annual"
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled"
]);

export const paymentModeEnum = pgEnum("payment_mode", [
  "neft_rtgs",
  "upi",
  "cheque",
  "ach",
  "credit_card"
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "cam",
  "property_tax",
  "insurance",
  "utility_water",
  "utility_power",
  "repairs_maintenance",
  "statutory_fees",
  "mgmt_fee",
  "other"
]);

export const tenantStatusEnum = pgEnum("tenant_status", [
  "active",
  "inactive",
  "prospect",
  "blacklisted"
]);

export const escalationApplyStatusEnum = pgEnum("escalation_apply_status", [
  "pending",
  "applied",
  "waived",
  "disputed"
]);

export const noticeReasonEnum = pgEnum("notice_reason", [
  "relocation",
  "downsizing",
  "cost",
  "lease_expiry",
  "dispute",
  "other"
]);

// 2. Core User & Org Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").default("tenant_admin").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  pan: varchar("pan", { length: 10 }),
  gstin: varchar("gstin", { length: 15 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  fyStartMonth: integer("fy_start_month").default(4).notNull(), // April by default
  invoicePrefix: varchar("invoice_prefix", { length: 20 }).default("INV").notNull(),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  microMarket: varchar("micro_market", { length: 150 }),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  grade: propertyGradeEnum("grade").default("A").notNull(),
  totalArea: decimal("total_area", { precision: 12, scale: 2 }).notNull(),
  chargeableArea: decimal("chargeable_area", { precision: 12, scale: 2 }),
  occupancyTargetPct: decimal("occupancy_target_pct", { precision: 5, scale: 2 }).default("90.00"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  ownerName: varchar("owner_name", { length: 100 }),
  ownerCompany: varchar("owner_company", { length: 255 }),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

export const userProperties = pgTable("user_properties", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull()
});

// Property Hierarchy: Property -> Buildings -> Floors -> Spaces / Units
export const buildings = pgTable("buildings", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  buildingName: varchar("building_name", { length: 255 }).notNull(),
  buildingCode: varchar("building_code", { length: 50 }),
  totalFloors: integer("total_floors").default(1).notNull(),
  totalArea: decimal("total_area", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const floors = pgTable("floors", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  floorNumber: integer("floor_number").notNull(),
  floorName: varchar("floor_name", { length: 100 }).notNull(),
  totalArea: decimal("total_area", { precision: 12, scale: 2 }),
  commonArea: decimal("common_area", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const spaces = pgTable("spaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "set null" }),
  floorId: uuid("floor_id").references(() => floors.id, { onDelete: "set null" }),
  spaceNumber: varchar("space_number", { length: 50 }).notNull(),
  spaceType: varchar("space_type", { length: 50 }).default("office").notNull(), // office, retail, food_court, warehouse, storage, parking
  floorNumber: integer("floor_number").default(1).notNull(),
  carpetArea: decimal("carpet_area", { precision: 10, scale: 2 }),
  chargeableArea: decimal("chargeable_area", { precision: 10, scale: 2 }).notNull(),
  standardRatePsf: decimal("standard_rate_psf", { precision: 10, scale: 2 }),
  standardCamPsf: decimal("standard_cam_psf", { precision: 10, scale: 2 }),
  status: unitStatusEnum("status").default("available").notNull(),
  currentLeaseId: uuid("current_lease_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Backward compatible unit table
export const leaseUnits = pgTable("lease_units", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  unitNumber: varchar("unit_number", { length: 50 }).notNull(),
  floorNumber: integer("floor_number").notNull(),
  areaSqft: decimal("area_sqft", { precision: 10, scale: 2 }).notNull(),
  baseRent: decimal("base_rent", { precision: 12, scale: 2 }).notNull(),
  status: unitStatusEnum("status").default("available").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Tenants Master Table (Companies / Entities)
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  tenantCode: varchar("tenant_code", { length: 50 }).unique().notNull(),
  tradeName: varchar("trade_name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  pan: varchar("pan", { length: 10 }),
  gstin: varchar("gstin", { length: 15 }),
  tan: varchar("tan", { length: 10 }),
  cin: varchar("cin", { length: 21 }),
  contactPerson: varchar("contact_person", { length: 150 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
  billingAddress: text("billing_address").notNull(),
  billingCity: varchar("billing_city", { length: 100 }).notNull(),
  billingState: varchar("billing_state", { length: 100 }).notNull(),
  billingPincode: varchar("billing_pincode", { length: 10 }).notNull(),
  status: tenantStatusEnum("status").default("active").notNull(),
  creditLimit: decimal("credit_limit", { precision: 14, scale: 2 }),
  paymentTermsDays: integer("payment_terms_days").default(30),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Master Leases Table (39 Excel Columns + Full Spec)
export const leases = pgTable("leases", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "set null" }),
  floorId: uuid("floor_id").references(() => floors.id, { onDelete: "set null" }),
  spaceId: uuid("space_id").references(() => spaces.id, { onDelete: "set null" }),
  unitId: uuid("unit_id").references(() => leaseUnits.id, { onDelete: "set null" }),
  tenantCompanyId: uuid("tenant_company_id").references(() => tenants.id, { onDelete: "set null" }),
  tenantId: uuid("tenant_id").references(() => users.id, { onDelete: "set null" }), // legacy compatibility

  leaseCode: varchar("lease_code", { length: 50 }),
  tradeName: varchar("trade_name", { length: 255 }),

  // Key Dates
  startDate: date("start_date").notNull(), // commencement date
  endDate: date("expiry_date").notNull(), // expiry date
  handoverDate: date("handover_date"),
  fitoutPeriodDays: integer("fitout_period_days").default(0),
  rentFreePeriodDays: integer("rent_free_period_days").default(0),
  rentCommencementDate: date("rent_commencement_date"),

  // Space & Area
  unitNumber: varchar("unit_number", { length: 50 }),
  floorNumber: integer("floor_number").default(1),
  carpetArea: decimal("carpet_area", { precision: 10, scale: 2 }),
  chargeableArea: decimal("chargeable_area", { precision: 10, scale: 2 }),

  // Rent & Commercials
  monthlyRent: decimal("monthly_rent", { precision: 14, scale: 2 }).notNull(), // Base Rent monthly
  baseRentPsf: decimal("base_rent_psf", { precision: 10, scale: 2 }),
  camRatePsf: decimal("cam_rate_psf", { precision: 10, scale: 2 }).default("0.00"),
  camMonthly: decimal("cam_monthly", { precision: 14, scale: 2 }).default("0.00"),
  utilityFixedMonthly: decimal("utility_fixed_monthly", { precision: 14, scale: 2 }).default("0.00"),
  parkingChargesMonthly: decimal("parking_charges_monthly", { precision: 14, scale: 2 }).default("0.00"),
  signageChargesMonthly: decimal("signage_charges_monthly", { precision: 14, scale: 2 }).default("0.00"),
  otherChargesMonthly: decimal("other_charges_monthly", { precision: 14, scale: 2 }).default("0.00"),
  totalMonthlyGross: decimal("total_monthly_gross", { precision: 14, scale: 2 }),
  annualRentGross: decimal("annual_rent_gross", { precision: 16, scale: 2 }),

  // Security Deposit
  securityDepositMonths: integer("security_deposit_months").default(6),
  securityDeposit: decimal("security_deposit", { precision: 14, scale: 2 }).notNull(), // Required deposit
  securityDepositPaid: decimal("security_deposit_paid", { precision: 14, scale: 2 }).default("0.00"),
  securityDepositBank: varchar("security_deposit_bank", { length: 100 }),
  securityDepositBgReference: varchar("security_deposit_bg_ref", { length: 100 }),

  // Escalation Terms
  escalationPct: decimal("escalation_pct", { precision: 5, scale: 2 }).default("5.00").notNull(),
  escalationFrequencyMonths: integer("escalation_frequency_months").default(12),
  nextEscalationDate: date("next_escalation_date"),

  // Lock-in & Notice
  lockInMonths: integer("lock_in_months").default(36).notNull(),
  lockInEndDate: date("lock_in_end_date"),
  noticePeriodDays: integer("notice_period_days").default(90).notNull(),

  // Status & Lifecycle
  status: varchar("status", { length: 50 }).default("active").notNull(),
  renewalStatus: varchar("renewal_status", { length: 50 }).default("not_due").notNull(),

  // Billing & Tax Terms
  billingFrequency: varchar("billing_frequency", { length: 50 }).default("monthly").notNull(),
  billingDueDay: integer("billing_due_day").default(5),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).default("18.00"),
  tdsRate: decimal("tds_rate", { precision: 5, scale: 2 }).default("10.00"),

  // Broker & Exit
  brokerName: varchar("broker_name", { length: 150 }),
  brokeragePaid: decimal("brokerage_paid", { precision: 14, scale: 2 }).default("0.00"),
  terminationDate: date("termination_date"),
  terminationReason: text("termination_reason"),
  signedAgreementUrl: text("signed_agreement_url"),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Escalations Schedule & Log
export const escalations = pgTable("escalations", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaseId: uuid("lease_id").references(() => leases.id, { onDelete: "cascade" }).notNull(),
  escalationDate: date("escalation_date").notNull(),
  previousRent: decimal("previous_rent", { precision: 14, scale: 2 }).notNull(),
  newRent: decimal("new_rent", { precision: 14, scale: 2 }).notNull(),
  escalationPct: decimal("escalation_pct", { precision: 5, scale: 2 }).notNull(),
  calculatedIncrease: decimal("calculated_increase", { precision: 14, scale: 2 }).notNull(),
  status: escalationApplyStatusEnum("status").default("pending").notNull(),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  appliedBy: uuid("applied_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Invoices Table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  leaseId: uuid("lease_id").references(() => leases.id, { onDelete: "cascade" }).notNull(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  invoiceNumber: varchar("invoice_number", { length: 100 }).unique().notNull(),
  fyYear: varchar("fy_year", { length: 10 }), // e.g. "2024-25"
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),

  baseRent: decimal("base_rent", { precision: 14, scale: 2 }).notNull(),
  camCharges: decimal("cam_charges", { precision: 14, scale: 2 }).default("0.00"),
  utilityCharges: decimal("utility_charges", { precision: 14, scale: 2 }).default("0.00"),
  otherCharges: decimal("other_charges", { precision: 14, scale: 2 }).default("0.00"),
  subtotal: decimal("subtotal", { precision: 14, scale: 2 }).notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).default("18.00"),
  gstAmount: decimal("gst_amount", { precision: 14, scale: 2 }).notNull(),
  grossTotal: decimal("gross_total", { precision: 14, scale: 2 }).notNull(),
  tdsDeducted: decimal("tds_deducted", { precision: 14, scale: 2 }).default("0.00"),
  netPayable: decimal("net_payable", { precision: 14, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 14, scale: 2 }).default("0.00"),
  balanceDue: decimal("balance_due", { precision: 14, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").default("issued").notNull(),
  pdfUrl: text("pdf_url"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  hsnSacCode: varchar("hsn_sac_code", { length: 20 }).default("997212"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00"),
  rate: decimal("rate", { precision: 14, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).default("18.00"),
  gstAmount: decimal("gst_amount", { precision: 14, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 14, scale: 2 }).notNull()
});

// Collections / Receipts Table
export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  leaseId: uuid("lease_id").references(() => leases.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  receiptNumber: varchar("receipt_number", { length: 100 }).unique().notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMode: paymentModeEnum("payment_mode").default("neft_rtgs").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }), // UTR / Cheque / Txn ID
  amountReceived: decimal("amount_received", { precision: 14, scale: 2 }).notNull(),
  tdsDeducted: decimal("tds_deducted", { precision: 14, scale: 2 }).default("0.00"),
  bankCharges: decimal("bank_charges", { precision: 10, scale: 2 }).default("0.00"),
  netCredited: decimal("net_credited", { precision: 14, scale: 2 }).notNull(),
  bankAccount: varchar("bank_account", { length: 100 }),
  notes: text("notes"),
  recordedBy: uuid("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Property Expenses / Outgoings Table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  expenseCategory: expenseCategoryEnum("expense_category").default("cam").notNull(),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  expenseDate: date("expense_date").notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  gstAmount: decimal("gst_amount", { precision: 14, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 14, scale: 2 }).notNull(),
  paidDate: date("paid_date"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("paid").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Lease Notices & Terminations
export const leaseNotices = pgTable("lease_notices", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaseId: uuid("lease_id").references(() => leases.id, { onDelete: "cascade" }).notNull(),
  noticeDate: date("notice_date").notNull(),
  effectiveDate: date("effective_date").notNull(),
  noticeReason: noticeReasonEnum("notice_reason").default("lease_expiry").notNull(),
  initiatedBy: varchar("initiated_by", { length: 20 }).default("tenant").notNull(), // tenant, landlord
  remarks: text("remarks"),
  penaltyAmount: decimal("penalty_amount", { precision: 14, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Rent Roll Snapshots (Monthly Historical Roll-ups)
export const rentRollSnapshots = pgTable("rent_roll_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  snapshotMonth: date("snapshot_month").notNull(),
  totalProperties: integer("total_properties").notNull(),
  totalArea: decimal("total_area", { precision: 14, scale: 2 }).notNull(),
  occupiedArea: decimal("occupied_area", { precision: 14, scale: 2 }).notNull(),
  vacantArea: decimal("vacant_area", { precision: 14, scale: 2 }).notNull(),
  occupancyPct: decimal("occupancy_pct", { precision: 5, scale: 2 }).notNull(),
  totalMonthlyRevenue: decimal("total_monthly_revenue", { precision: 16, scale: 2 }).notNull(),
  totalCam: decimal("total_cam", { precision: 14, scale: 2 }).notNull(),
  totalCollections: decimal("total_collections", { precision: 16, scale: 2 }).notNull(),
  totalOutstanding: decimal("total_outstanding", { precision: 16, scale: 2 }).notNull(),
  noiMonthly: decimal("noi_monthly", { precision: 16, scale: 2 }).notNull(),
  averageRatePsf: decimal("average_rate_psf", { precision: 10, scale: 2 }).notNull(),
  waltMonths: decimal("walt_months", { precision: 6, scale: 2 }).notNull(),
  dataJson: jsonb("data_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Alert Notifications
export const alertNotifications = pgTable("alert_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  alertType: varchar("alert_type", { length: 100 }).notNull(), // expiry_90, expiry_60, expiry_30, escalation_due, invoice_overdue, lockin_expiring, deposit_shortfall
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // lease, invoice, collection, property
  entityId: uuid("entity_id"),
  severity: varchar("severity", { length: 50 }).default("info").notNull(), // info, warning, critical
  isRead: boolean("is_read").default(false).notNull(),
  triggerDate: date("trigger_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Audit Log for Rent Roll Actions
export const rentRollAuditLogs = pgTable("rent_roll_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaseId: uuid("lease_id"),
  entityName: varchar("entity_name", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// System / Org Configurations
export const rentRollConfigurations = pgTable("rent_roll_configurations", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// 3. Procurement & Operations Tables (Preserved)
export const rfqs = pgTable("rfqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  scopeOfWork: text("scope_of_work").notNull(),
  manpowerRequired: integer("manpower_required"),
  quoteDeadline: timestamp("quote_deadline", { withTimezone: true }).notNull(),
  status: rfqStatusEnum("status").default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  rfqId: uuid("rfq_id").references(() => rfqs.id),
  vendorId: uuid("vendor_id").references(() => users.id),
  baseQuote: decimal("base_quote", { precision: 12, scale: 2 }).notNull(),
  gstAmt: decimal("gst_amt", { precision: 12, scale: 2 }).notNull(),
  grossQuote: decimal("gross_quote", { precision: 12, scale: 2 }).notNull(),
  responseSlaMins: integer("response_sla_mins").notNull(),
  resolutionSlaMins: integer("resolution_sla_mins").notNull(),
  status: quoteStatusEnum("status").default("submitted"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const workOrders = pgTable("work_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  rfqId: uuid("rfq_id").references(() => rfqs.id),
  vendorId: uuid("vendor_id").references(() => users.id),
  grossValue: decimal("gross_value", { precision: 12, scale: 2 }).notNull(),
  milestones: jsonb("milestones").notNull(),
  status: woStatusEnum("status").default("issued"),
  escrowTransactionId: varchar("escrow_transaction_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const complianceCertificates = pgTable("compliance_certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id),
  name: varchar("name", { length: 255 }).notNull(),
  issuingAuthority: varchar("issuing_authority", { length: 255 }).notNull(),
  expiryDate: date("expiry_date").notNull(),
  certificateUrl: varchar("certificate_url", { length: 255 }),
  status: varchar("status", { length: 50 }).default("valid"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const helpdeskTickets = pgTable("helpdesk_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => users.id),
  propertyId: uuid("property_id").references(() => properties.id),
  category: varchar("category", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  slaResponseDeadline: timestamp("sla_response_deadline", { withTimezone: true }).notNull(),
  slaResolutionDeadline: timestamp("sla_resolution_deadline", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 50 }).default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const utilityMetrics = pgTable("utility_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id),
  monthYear: date("month_year").notNull(),
  electricityKwh: decimal("electricity_kwh", { precision: 12, scale: 2 }).notNull(),
  waterKl: decimal("water_kl", { precision: 12, scale: 2 }).notNull(),
  dgRuntimeHours: decimal("dg_runtime_hours", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id),
  traceId: varchar("trace_id", { length: 100 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  action: text("action").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  severity: varchar("severity", { length: 50 }).notNull(),
  isAiPrediction: boolean("is_ai_prediction").default(false),
  humanOverrideAction: text("human_override_action"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 100 }).unique().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  locationDetails: text("location_details"),
  manufacturer: varchar("manufacturer", { length: 100 }),
  commissioningDate: date("commissioning_date"),
  warrantyExpiry: date("warranty_expiry"),
  assignedVendorId: uuid("assigned_vendor_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("operational").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const ppmTasks = pgTable("ppm_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  taskName: varchar("task_name", { length: 255 }).notNull(),
  scheduledWeek: integer("scheduled_week").notNull(),
  scheduledDate: date("scheduled_date"),
  assignedTechnicianId: uuid("assigned_technician_id").references(() => users.id),
  checklists: jsonb("checklists"),
  status: varchar("status", { length: 50 }).default("scheduled").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true })
});

export const tenantOnboarding = pgTable("tenant_onboarding", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaseId: uuid("lease_id").references(() => leases.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  onboardingTasks: jsonb("onboarding_tasks").notNull(),
  fitoutStartDate: date("fitout_start_date"),
  moveInDate: date("move_in_date"),
  status: varchar("status", { length: 50 }).default("pending").notNull()
});

export const officexScores = pgTable("officex_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }).notNull(),
  workplaceHealthScore: decimal("workplace_health_score", { precision: 5, scale: 2 }).notNull(),
  slaComplianceScore: decimal("sla_compliance_score", { precision: 5, scale: 2 }).notNull(),
  energyEfficiencyScore: decimal("energy_efficiency_score", { precision: 5, scale: 2 }).notNull(),
  recordedMonth: date("recorded_month").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

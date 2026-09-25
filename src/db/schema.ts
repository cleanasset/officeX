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

// =========================================================================
// REGISTRATION & ONBOARDING SUITE (V1.0 SPECIFICATION TABLES)
// =========================================================================

// Organization Memberships (User <-> Org <-> Role)
export const organizationMemberships = pgTable("organization_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 50 }).default("org_admin").notNull(), // org_admin, manager, member, authorized_signatory
  designation: varchar("designation", { length: 100 }),
  isAuthorizedSignatory: boolean("is_authorized_signatory").default(false).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Property Owner Profiles
export const ownerProfiles = pgTable("owner_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  ownershipType: varchar("ownership_type", { length: 50 }).notNull(), // OWNER, CO_OWNER, DEVELOPER, INVESTOR, ASSET_MANAGER, AUTHORIZED_REPRESENTATIVE
  assetTypes: jsonb("asset_types").notNull(), // ["OFFICE", "IT_PARK", "RETAIL", ...]
  portfolioPropertyCount: integer("portfolio_property_count").default(0),
  portfolioAreaSqft: decimal("portfolio_area_sqft", { precision: 14, scale: 2 }).default("0.00"),
  operatingCities: jsonb("operating_cities").notNull(),
  approxLeasableAreaSqft: decimal("approx_leasable_area_sqft", { precision: 14, scale: 2 }).default("0.00"),
  approxOccupancyPct: decimal("approx_occupancy_pct", { precision: 5, scale: 2 }).default("0.00"),
  servicesRequired: jsonb("services_required"),
  ownershipProofRequired: boolean("ownership_proof_required").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Broker / Channel Partner Profiles
export const brokerProfiles = pgTable("broker_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  brokerType: varchar("broker_type", { length: 50 }).notNull(), // INDIVIDUAL, FIRM, CHANNEL_PARTNER
  services: jsonb("services").notNull(), // ["COMMERCIAL_LEASING", "OFFICE", "RETAIL", ...]
  operatingCities: jsonb("operating_cities").notNull(),
  operatingMicroMarkets: jsonb("operating_micro_markets"),
  reraApplicable: boolean("rera_applicable").default(false).notNull(),
  reraRegistrationNo: varchar("rera_registration_no", { length: 50 }),
  yearsInBusiness: integer("years_in_business").default(0),
  teamSizeBand: varchar("team_size_band", { length: 50 }),
  clientTypes: jsonb("client_types"),
  typicalDealSizeBand: varchar("typical_deal_size_band", { length: 50 }),
  transactionsPerYearBand: varchar("transactions_per_year_band", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Facility & Service Vendor Profiles
export const vendorProfiles = pgTable("vendor_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  vendorCategory: jsonb("vendor_category").notNull(), // ["HOUSEKEEPING", "SECURITY", "MEP", "HVAC", ...]
  serviceSubcategories: jsonb("service_subcategories"),
  citiesServed: jsonb("cities_served").notNull(),
  buildingSegments: jsonb("building_segments").notNull(), // ["OFFICE", "IT_PARK", "RETAIL", ...]
  yearsInBusiness: integer("years_in_business").default(0).notNull(),
  employeeCount: integer("employee_count").default(0),
  technicalStaffCount: integer("technical_staff_count").default(0),
  activeClientCount: integer("active_client_count").default(0),
  managedAreaSqft: decimal("managed_area_sqft", { precision: 14, scale: 2 }).default("0.00"),
  insuranceAvailable: boolean("insurance_available").default(false).notNull(),
  pfRegistration: boolean("pf_registration").default(false),
  esicRegistration: boolean("esic_registration").default(false),
  isoCertifications: jsonb("iso_certifications"),
  licensesCertifications: jsonb("licenses_certifications"),
  rfpResponseEnabled: boolean("rfp_response_enabled").default(true).notNull(),
  bankDetailsStatus: varchar("bank_details_status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Document Master (PAN, GSTIN, CIN, RERA, Ownership Proof, etc.)
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // PAN, GST_CERTIFICATE, CIN_CERTIFICATE, RERA, OWNERSHIP_PROOF, AUTHORIZATION, etc.
  documentNumber: varchar("document_number", { length: 100 }),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  fileUri: text("file_uri").notNull(),
  mimeType: varchar("mime_type", { length: 50 }).default("application/pdf").notNull(),
  fileSizeBytes: integer("file_size_bytes").default(0).notNull(),
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending").notNull(), // pending, verified, rejected, expired
  reviewerId: uuid("reviewer_id").references(() => users.id),
  reviewComment: text("review_comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// KYC Cases (K0 to K5 State Machine)
export const kycCases = pgTable("kyc_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stage: varchar("stage", { length: 50 }).default("K0_CONTACT").notNull(), // K0_CONTACT, K1_BUSINESS, K2_IDENTITY, K3_PROPERTY, K4_VENDOR, K5_PAYMENT
  status: varchar("status", { length: 50 }).default("submitted").notNull(), // not_started, in_progress, submitted, verified, rejected, resubmitted
  submissionNotes: text("submission_notes"),
  reviewerId: uuid("reviewer_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewerNotes: text("reviewer_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// ═══════════════════════════════════════════════════════════════════════════
// VISITOR MANAGEMENT DOMAIN (Specification Section 6)
// ═══════════════════════════════════════════════════════════════════════════

export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  visitorType: varchar("visitor_type", { length: 50 }).default("guest").notNull(), // guest, client, candidate, contractor, vendor, delivery, service_provider, recurring, vip, emergency
  name: varchar("name", { length: 150 }).notNull(),
  company: varchar("company", { length: 150 }),
  mobile: varchar("mobile", { length: 30 }).notNull(),
  email: varchar("email", { length: 150 }),
  photoRef: text("photo_ref"),
  identityType: varchar("identity_type", { length: 50 }),
  identityRefToken: varchar("identity_ref_token", { length: 100 }),
  consentFlag: boolean("consent_flag").default(true).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitorId: uuid("visitor_id").references(() => visitors.id, { onDelete: "cascade" }).notNull(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  buildingId: uuid("building_id"),
  zoneId: varchar("zone_id", { length: 100 }),
  hostUserId: uuid("host_user_id").references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  purpose: varchar("purpose", { length: 255 }).notNull(),
  visitStart: timestamp("visit_start", { withTimezone: true }).notNull(),
  visitEnd: timestamp("visit_end", { withTimezone: true }).notNull(),
  approvalStatus: varchar("approval_status", { length: 50 }).default("approved").notNull(), // pending, approved, rejected, delegated
  checkinAt: timestamp("checkin_at", { withTimezone: true }),
  checkoutAt: timestamp("checkout_at", { withTimezone: true }),
  status: varchar("status", { length: 50 }).default("pre_registered").notNull(), // pre_registered, approved, checked_in, checked_out, overstay, cancelled, denied
  riskLevel: varchar("risk_level", { length: 20 }).default("low").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitId: uuid("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull(),
  registrationNo: varchar("registration_no", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).default("FOUR_WHEELER").notNull(),
  parkingSlot: varchar("parking_slot", { length: 50 }),
  inAt: timestamp("in_at", { withTimezone: true }),
  outAt: timestamp("out_at", { withTimezone: true })
});

export const visitorApprovals = pgTable("visitor_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitId: uuid("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull(),
  approverId: uuid("approver_id").references(() => users.id).notNull(),
  decision: varchar("decision", { length: 50 }).notNull(), // approved, rejected, modified, delegated
  reason: text("reason"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull()
});

export const accessPasses = pgTable("access_passes", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitId: uuid("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull(),
  passType: varchar("pass_type", { length: 50 }).default("DIGITAL_QR").notNull(),
  qrToken: varchar("qr_token", { length: 255 }).unique().notNull(),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
  validTo: timestamp("valid_to", { withTimezone: true }).notNull(),
  accessZones: text("access_zones").default("LOBBY").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
  status: varchar("status", { length: 50 }).default("active").notNull()
});

export const accessEvents = pgTable("access_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  passId: uuid("pass_id").references(() => accessPasses.id),
  visitorId: uuid("visitor_id").references(() => visitors.id),
  accessPoint: varchar("access_point", { length: 100 }).notNull(),
  direction: varchar("direction", { length: 20 }).default("IN").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  sourceSystem: varchar("source_system", { length: 100 }).default("GUNNEBO_OPTICAL").notNull(),
  result: varchar("result", { length: 50 }).default("GRANTED").notNull()
});

export const watchlist = pgTable("watchlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  identityReference: varchar("identity_reference", { length: 150 }).notNull(),
  reason: text("reason").notNull(),
  activeFrom: timestamp("active_from", { withTimezone: true }).defaultNow().notNull(),
  activeTo: timestamp("active_to", { withTimezone: true }),
  approvalStatus: varchar("approval_status", { length: 50 }).default("active").notNull()
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE MANAGEMENT DOMAIN (Specification Section 6)
// ═══════════════════════════════════════════════════════════════════════════

export const complianceObligations = pgTable("compliance_obligations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  authority: varchar("authority", { length: 150 }).notNull(),
  requirement: text("requirement").notNull(),
  frequency: varchar("frequency", { length: 50 }).default("ANNUAL").notNull(),
  ownerId: uuid("owner_id").references(() => users.id),
  criticality: varchar("criticality", { length: 20 }).default("HIGH").notNull(),
  evidenceRequired: boolean("evidence_required").default(true).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const complianceSchedules = pgTable("compliance_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  obligationId: uuid("obligation_id").references(() => complianceObligations.id, { onDelete: "cascade" }).notNull(),
  dueDate: date("due_date").notNull(),
  reminderDays: integer("reminder_days").default(30).notNull(),
  recurrenceRule: varchar("recurrence_rule", { length: 100 }),
  status: varchar("status", { length: 50 }).default("upcoming").notNull()
});

export const complianceEvidence = pgTable("compliance_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  obligationId: uuid("obligation_id").references(() => complianceObligations.id, { onDelete: "cascade" }).notNull(),
  documentId: uuid("document_id").references(() => documents.id),
  documentTitle: varchar("document_title", { length: 255 }).notNull(),
  fileUri: text("file_uri"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending").notNull(),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at", { withTimezone: true })
});

export const inspections = pgTable("inspections", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  assetId: uuid("asset_id"),
  vendorId: uuid("vendor_id"),
  type: varchar("type", { length: 100 }).notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  inspectorId: uuid("inspector_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("scheduled").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  completedAt: timestamp("completed_at", { withTimezone: true })
});

export const inspectionFindings = pgTable("inspection_findings", {
  id: uuid("id").primaryKey().defaultRandom(),
  inspectionId: uuid("inspection_id").references(() => inspections.id, { onDelete: "cascade" }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  observation: text("observation").notNull(),
  evidenceUri: text("evidence_uri"),
  capaId: uuid("capa_id")
});

export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  incidentType: varchar("incident_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  reportedAt: timestamp("reported_at", { withTimezone: true }).defaultNow().notNull(),
  personsInvolved: text("persons_involved"),
  description: text("description").notNull(),
  immediateAction: text("immediate_action").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull()
});

export const capa = pgTable("capa", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  sourceId: varchar("source_id", { length: 100 }),
  actionType: varchar("action_type", { length: 50 }).default("CORRECTIVE").notNull(),
  action: text("action").notNull(),
  ownerId: uuid("owner_id").references(() => users.id),
  dueDate: date("due_date").notNull(),
  priority: varchar("priority", { length: 20 }).default("high").notNull(),
  evidenceUri: text("evidence_uri"),
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending").notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true })
});

export const permits = pgTable("permits", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  vendorId: uuid("vendor_id"),
  contractor: varchar("contractor", { length: 150 }).notNull(),
  permitType: varchar("permit_type", { length: 100 }).notNull(),
  riskControls: text("risk_controls").notNull(),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
  validTo: timestamp("valid_to", { withTimezone: true }).notNull(),
  approverId: uuid("approver_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("pending_approval").notNull()
});

export const risks = pgTable("risks", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  statement: text("statement").notNull(),
  likelihood: integer("likelihood").default(3).notNull(),
  impact: integer("impact").default(3).notNull(),
  inherentScore: integer("inherent_score").default(9).notNull(),
  mitigation: text("mitigation").notNull(),
  residualScore: integer("residual_score").default(4).notNull(),
  ownerId: uuid("owner_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("active").notNull()
});

export const auditFindings = pgTable("audit_findings", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditId: varchar("audit_id", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  finding: text("finding").notNull(),
  ownerId: uuid("owner_id").references(() => users.id),
  dueDate: date("due_date").notNull(),
  capaId: uuid("capa_id"),
  closureStatus: varchar("closure_status", { length: 50 }).default("open").notNull()
});

// =========================================================================
// SECTION 4 CANONICAL RENT ROLL & STANDALONE SAAS TABLES (V2.1 SPECIFICATION)
// =========================================================================

// Entitlements Master
export const entitlements = pgTable("entitlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  productCode: varchar("product_code", { length: 50 }).default("RR").notNull(), // RR, CAFM, LEASING_CRM
  edition: varchar("edition", { length: 50 }).default("professional").notNull(), // essentials, professional, enterprise
  addons: jsonb("addons").default([]).notNull(), // ["multi_client_operator", "flex_seats", "integrations"]
  status: varchar("status", { length: 50 }).default("active").notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Client Accounts (Multi-client operator layer: Owners whose portfolios a subscriber manages)
export const clientAccounts = pgTable("client_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  accountCode: varchar("account_code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 150 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
  portalAccessEnabled: boolean("portal_access_enabled").default(false).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Billing Entities (One per SPV / state GSTIN)
export const billingEntities = pgTable("billing_entities", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  clientAccountId: uuid("client_account_id").references(() => clientAccounts.id, { onDelete: "set null" }),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  tradeName: varchar("trade_name", { length: 255 }),
  pan: varchar("pan", { length: 10 }).notNull(),
  gstin: varchar("gstin", { length: 15 }).notNull(),
  stateCode: varchar("state_code", { length: 5 }).notNull(), // e.g. "27" for MH
  registeredAddress: text("registered_address").notNull(),
  bankName: varchar("bank_name", { length: 150 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  bankIfsc: varchar("bank_ifsc", { length: 20 }),
  bankBranch: varchar("bank_branch", { length: 100 }),
  invoicePrefix: varchar("invoice_prefix", { length: 20 }).default("INV-2026").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Management Mandates (Operator fee rules & collection terms)
export const managementMandates = pgTable("management_mandates", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  clientAccountId: uuid("client_account_id").references(() => clientAccounts.id, { onDelete: "cascade" }).notNull(),
  mandateName: varchar("mandate_name", { length: 255 }).notNull(),
  feeModel: varchar("fee_model", { length: 50 }).default("pct_collections").notNull(), // pct_collections, flat_monthly, per_sqft
  feeRate: decimal("fee_rate", { precision: 10, scale: 2 }).notNull(),
  settlementType: varchar("settlement_type", { length: 50 }).default("direct_to_owner").notNull(), // direct_to_owner, operator_escrow
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Pricing Plans Master (For Managed Office & Flex Segments)
export const pricingPlans = pgTable("pricing_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  planName: varchar("plan_name", { length: 150 }).notNull(),
  seatType: varchar("seat_type", { length: 50 }).notNull(), // hot_desk, dedicated_desk, private_cabin, enterprise_suite
  ratePerMonth: decimal("rate_per_month", { precision: 12, scale: 2 }).notNull(),
  inclusions: jsonb("inclusions"), // ["high_speed_wifi", "meeting_room_credits", "tea_coffee", "housekeeping"]
  securityDepositMonths: integer("security_deposit_months").default(2).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Seat Inventory (For Flex Centres)
export const seatInventories = pgTable("seat_inventories", {
  id: uuid("id").primaryKey().defaultRandom(),
  spaceId: uuid("space_id").references(() => spaces.id, { onDelete: "cascade" }).notNull(),
  seatType: varchar("seat_type", { length: 50 }).notNull(),
  totalSeats: integer("total_seats").notNull(),
  occupiedSeats: integer("occupied_seats").default(0).notNull(),
  reservedSeats: integer("reserved_seats").default(0).notNull(),
  availableSeats: integer("available_seats").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Deals / Pipeline Register (§4.7A)
export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  prospectName: varchar("prospect_name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 150 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  proposedSpaceId: uuid("proposed_space_id").references(() => spaces.id),
  proposedAreaSqft: decimal("proposed_area_sqft", { precision: 12, scale: 2 }),
  proposedSeats: integer("proposed_seats"),
  targetRentPsf: decimal("target_rent_psf", { precision: 10, scale: 2 }),
  targetCommencementDate: date("target_commencement_date"),
  stage: varchar("stage", { length: 50 }).default("qualified").notNull(), // enquiry, qualified, viewing, proposal_sent, term_sheet, won, lost
  probabilityPct: integer("probability_pct").default(50).notNull(),
  brokerId: uuid("broker_id").references(() => users.id),
  convertedContractId: uuid("converted_contract_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Multi-Charge Lines per Contract (§4.8)
export const contractCharges = pgTable("contract_charges", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id").references(() => leases.id, { onDelete: "cascade" }).notNull(),
  chargeType: varchar("charge_type", { length: 50 }).notNull(), // base_rent, cam, electricity, parking, dg_backup, signage, internet, housekeeping
  billingModel: varchar("billing_model", { length: 50 }).default("area").notNull(), // area, seat, fixed, meter, formula
  rate: decimal("rate", { precision: 12, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).default("psf_month").notNull(), // psf_month, per_seat_month, fixed_month, per_kwh
  monthlyAmount: decimal("monthly_amount", { precision: 14, scale: 2 }).notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).default("18.00").notNull(),
  hsnSacCode: varchar("hsn_sac_code", { length: 20 }).default("997212").notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Pre-computed Stepped Escalation Steps (§4.7, RR-ESC-01)
export const rentSteps = pgTable("rent_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id").references(() => leases.id, { onDelete: "cascade" }).notNull(),
  stepNumber: integer("step_number").notNull(),
  effectiveDate: date("effective_date").notNull(),
  baseRatePsf: decimal("base_rate_psf", { precision: 10, scale: 2 }).notNull(),
  monthlyBaseRent: decimal("monthly_base_rent", { precision: 14, scale: 2 }).notNull(),
  escalationPct: decimal("escalation_pct", { precision: 5, scale: 2 }).notNull(),
  stepType: varchar("step_type", { length: 50 }).default("fixed_pct").notNull(), // fixed_pct, cpi_linked, market_review
  status: varchar("status", { length: 50 }).default("scheduled").notNull(), // scheduled, applied, skipped, disputed
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Contract Documents Repository with Versioning (§4.9)
export const contractDocuments = pgTable("contract_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id").references(() => leases.id, { onDelete: "cascade" }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // term_sheet, loi, agreement, amendment, notice, side_letter
  title: varchar("title", { length: 255 }).notNull(),
  versionNumber: integer("version_number").default(1).notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  status: varchar("status", { length: 50 }).default("executed").notNull(), // draft, under_review, executed, superseded
  isExecuted: boolean("is_executed").default(true).notNull(),
  executionDate: date("execution_date"),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Billing Runs (§4.2, RR-BIL-01)
export const billingRuns = pgTable("billing_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  billingEntityId: uuid("billing_entity_id").references(() => billingEntities.id),
  periodMonth: varchar("period_month", { length: 7 }).notNull(), // "2026-10"
  totalContracts: integer("total_contracts").notNull(),
  totalInvoicesGenerated: integer("total_invoices_generated").notNull(),
  grossBilledAmount: decimal("gross_billed_amount", { precision: 16, scale: 2 }).notNull(),
  totalGstAmount: decimal("total_gst_amount", { precision: 14, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("completed").notNull(), // draft, approved, issued
  runBy: uuid("run_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Payment Allocations Sub-ledger (Matches Collections to Invoices, RR-PAY-04)
export const paymentAllocations = pgTable("payment_allocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").references(() => collections.id, { onDelete: "cascade" }).notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  allocatedBaseRent: decimal("allocated_base_rent", { precision: 14, scale: 2 }).default("0.00").notNull(),
  allocatedCam: decimal("allocated_cam", { precision: 14, scale: 2 }).default("0.00").notNull(),
  allocatedGst: decimal("allocated_gst", { precision: 14, scale: 2 }).default("0.00").notNull(),
  allocatedOther: decimal("allocated_other", { precision: 14, scale: 2 }).default("0.00").notNull(),
  totalAllocated: decimal("total_allocated", { precision: 14, scale: 2 }).notNull(),
  allocatedAt: timestamp("allocated_at", { withTimezone: true }).defaultNow()
});

// Adjustment Notes (Credit & Debit Notes, RR-BIL-08)
export const adjustmentNotes = pgTable("adjustment_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  noteType: varchar("note_type", { length: 20 }).notNull(), // credit_note, debit_note
  noteNumber: varchar("note_number", { length: 100 }).unique().notNull(),
  reason: varchar("reason", { length: 100 }).notNull(), // cam_reconciliation, billing_correction, commercial_waiver
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  gstAmount: decimal("gst_amount", { precision: 14, scale: 2 }).notNull(),
  totalAdjustment: decimal("total_adjustment", { precision: 14, scale: 2 }).notNull(),
  issuedDate: date("issued_date").notNull(),
  status: varchar("status", { length: 50 }).default("applied").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Monthly Owner Statements (Multi-Client Operator Layer, RR-OPR-01)
export const ownerStatements = pgTable("owner_statements", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  clientAccountId: uuid("client_account_id").references(() => clientAccounts.id, { onDelete: "cascade" }).notNull(),
  statementNumber: varchar("statement_number", { length: 100 }).unique().notNull(),
  periodMonth: varchar("period_month", { length: 7 }).notNull(),
  grossBilled: decimal("gross_billed", { precision: 16, scale: 2 }).notNull(),
  totalCollected: decimal("total_collected", { precision: 16, scale: 2 }).notNull(),
  totalArrears: decimal("total_arrears", { precision: 16, scale: 2 }).notNull(),
  operatorManagementFee: decimal("operator_mgmt_fee", { precision: 14, scale: 2 }).notNull(),
  reimbursableExpenses: decimal("reimbursable_expenses", { precision: 14, scale: 2 }).default("0.00").notNull(),
  netRemittanceAmount: decimal("net_remittance_amount", { precision: 16, scale: 2 }).notNull(),
  remittanceStatus: varchar("remittance_status", { length: 50 }).default("pending").notNull(), // pending, remitted, acknowledged
  remittanceDate: date("remittance_date"),
  remittanceUtr: varchar("remittance_utr", { length: 100 }),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow()
});

// Import Pipeline & Staging Tables (§5.5, RR-ING)
export const importBatches = pgTable("import_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  billingModel: varchar("billing_model", { length: 50 }).default("area").notNull(),
  totalRows: integer("total_rows").notNull(),
  validRows: integer("valid_rows").notNull(),
  warningRows: integer("warning_rows").default(0).notNull(),
  errorRows: integer("error_rows").default(0).notNull(),
  controlTotalArea: decimal("control_total_area", { precision: 14, scale: 2 }).default("0.00"),
  controlTotalRent: decimal("control_total_rent", { precision: 16, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 50 }).default("staged").notNull(), // staged, validated, committed, rolled_back
  preparerId: uuid("preparer_id").references(() => users.id),
  committedAt: timestamp("committed_at", { withTimezone: true }),
  rolledBackAt: timestamp("rolled_back_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const importRows = pgTable("import_rows", {
  id: uuid("id").primaryKey().defaultRandom(),
  batchId: uuid("batch_id").references(() => importBatches.id, { onDelete: "cascade" }).notNull(),
  rowNumber: integer("row_number").notNull(),
  rawPayload: jsonb("raw_payload").notNull(),
  normalizedPayload: jsonb("normalized_payload"),
  validationStatus: varchar("validation_status", { length: 50 }).default("passed").notNull(), // passed, warning, failed
  ruleCodes: jsonb("rule_codes").default([]),
  errorDetails: text("error_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const mappingTemplates = pgTable("mapping_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  templateName: varchar("template_name", { length: 150 }).notNull(),
  sourceSystem: varchar("source_system", { length: 100 }), // Yardi, MRI, Excel_Custom
  columnMappings: jsonb("column_mappings").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});




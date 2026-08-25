import { pgTable, pgEnum, uuid, varchar, text, decimal, integer, timestamp, date, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Enums
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "property_manager",
  "facility_manager",
  "tenant_admin",
  "vendor_admin",
  "broker",
  "auditor"
]);

export const propertyGradeEnum = pgEnum("property_grade", ["A", "B", "C"]);
export const unitStatusEnum = pgEnum("unit_status", ["available", "leased", "in_negotiation"]);
export const rfqStatusEnum = pgEnum("rfq_status", ["open", "evaluating", "awarded", "closed"]);
export const quoteStatusEnum = pgEnum("quote_status", ["submitted", "shortlisted", "awarded", "declined"]);
export const woStatusEnum = pgEnum("wo_status", ["issued", "accepted", "in_progress", "completed"]);

// 2. Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").default("tenant_admin").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  grade: propertyGradeEnum("grade").default("A").notNull(),
  totalArea: decimal("total_area", { precision: 12, scale: 2 }).notNull(),
  ownerName: varchar("owner_name", { length: 100 }),
  ownerCompany: varchar("owner_company", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const userProperties = pgTable("user_properties", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull()
});

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

export const leases = pgTable("leases", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => users.id),
  unitId: uuid("unit_id").references(() => leaseUnits.id),
  startDate: date("start_date").notNull(),
  endDate: date("expiry_date").notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 12, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 12, scale: 2 }).notNull(),
  escalationPct: decimal("escalation_pct", { precision: 4, scale: 2 }).default("5.00").notNull(),
  lockInMonths: integer("lock_in_months").default(36).notNull(),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

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

// 3. Extended Operational Tables
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

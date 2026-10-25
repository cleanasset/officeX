import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  date,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ============================================================================
// OFFICEX Visitor Management & Compliance SaaS Database Schema
// Conforming to OFFICEX_Visitor_Compliance_SaaS_Functional_Specification_UAT.pdf
// ============================================================================

// 1. vc_visitors — Registered & recurring visitors
export const vcVisitors = pgTable(
  "vc_visitors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: varchar("org_id", { length: 100 }).notNull(),
    visitorType: varchar("visitor_type", { length: 50 }).notNull(), // guest, client, interview, contractor, vendor, delivery, recurring, vip, emergency
    name: varchar("name", { length: 255 }).notNull(),
    company: varchar("company", { length: 255 }),
    mobile: varchar("mobile", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }),
    photoUrl: text("photo_url"),
    identityType: varchar("identity_type", { length: 50 }), // aadhaar, driving_licence, passport, voter_id, employee_id, other
    identityRefToken: varchar("identity_ref_token", { length: 100 }),
    consentFlag: boolean("consent_flag").default(true),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vc_visitors_org").on(table.orgId),
    index("idx_vc_visitors_mobile").on(table.mobile),
    index("idx_vc_visitors_name").on(table.name),
  ]
);

// 2. vc_visits — Individual visit instances
export const vcVisits = pgTable(
  "vc_visits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitorId: uuid("visitor_id").references(() => vcVisitors.id, { onDelete: "cascade" }),
    orgId: varchar("org_id", { length: 100 }).notNull(),
    propertyId: varchar("property_id", { length: 100 }),
    propertyName: varchar("property_name", { length: 255 }),
    buildingId: varchar("building_id", { length: 100 }),
    floor: varchar("floor", { length: 50 }),
    zoneId: varchar("zone_id", { length: 100 }),
    hostUserId: varchar("host_user_id", { length: 100 }),
    hostName: varchar("host_name", { length: 255 }),
    hostEmail: varchar("host_email", { length: 255 }),
    hostPhone: varchar("host_phone", { length: 50 }),
    tenantId: varchar("tenant_id", { length: 100 }),
    tenantName: varchar("tenant_name", { length: 255 }),
    purpose: varchar("purpose", { length: 255 }),
    visitStart: timestamp("visit_start", { withTimezone: true }).notNull(),
    visitEnd: timestamp("visit_end", { withTimezone: true }).notNull(),
    approvalStatus: varchar("approval_status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected, auto_approved
    status: varchar("status", { length: 50 }).default("scheduled").notNull(), // scheduled, checked_in, checked_out, cancelled, overstay, denied
    checkinAt: timestamp("checkin_at", { withTimezone: true }),
    checkoutAt: timestamp("checkout_at", { withTimezone: true }),
    riskLevel: varchar("risk_level", { length: 20 }).default("low").notNull(), // low, medium, high
    specialInstructions: text("special_instructions"),
    checkinMethod: varchar("checkin_method", { length: 50 }), // kiosk, reception, qr_scan, guard
    checkoutNotes: text("checkout_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vc_visits_org").on(table.orgId),
    index("idx_vc_visits_visitor").on(table.visitorId),
    index("idx_vc_visits_status").on(table.status),
    index("idx_vc_visits_approval").on(table.approvalStatus),
    index("idx_vc_visits_start").on(table.visitStart),
  ]
);

// 3. vc_vehicles — Visitor vehicles parked on campus
export const vcVehicles = pgTable(
  "vc_vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitId: uuid("visit_id").references(() => vcVisits.id, { onDelete: "cascade" }),
    registrationNo: varchar("registration_no", { length: 50 }).notNull(),
    type: varchar("type", { length: 50 }).default("four_wheeler"), // two_wheeler, four_wheeler, commercial, ev
    parkingSlot: varchar("parking_slot", { length: 50 }),
    inAt: timestamp("in_at", { withTimezone: true }),
    outAt: timestamp("out_at", { withTimezone: true }),
    status: varchar("status", { length: 50 }).default("parked"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vc_vehicles_reg").on(table.registrationNo),
    index("idx_vc_vehicles_visit").on(table.visitId),
  ]
);

// 4. vc_approvals — Host and security approvals
export const vcApprovals = pgTable(
  "vc_approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitId: uuid("visit_id").references(() => vcVisits.id, { onDelete: "cascade" }),
    approverId: varchar("approver_id", { length: 100 }),
    approverName: varchar("approver_name", { length: 255 }),
    decision: varchar("decision", { length: 50 }).notNull(), // approved, rejected, delegated, waiting
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vc_approvals_visit").on(table.visitId),
  ]
);

// 5. vc_access_passes — Digital QR, printed badges & credentials
export const vcAccessPasses = pgTable(
  "vc_access_passes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitId: uuid("visit_id").references(() => vcVisits.id, { onDelete: "cascade" }),
    passNumber: varchar("pass_number", { length: 100 }).unique().notNull(),
    passType: varchar("pass_type", { length: 50 }).default("digital_qr").notNull(), // digital_qr, printed_badge, rfid_card
    qrToken: text("qr_token").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validTo: timestamp("valid_to", { withTimezone: true }).notNull(),
    accessZones: jsonb("access_zones").default(["Lobby", "Floor"]),
    status: varchar("status", { length: 50 }).default("active").notNull(), // active, used, expired, revoked, returned
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    returnedAt: timestamp("returned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vc_passes_visit").on(table.visitId),
    index("idx_vc_passes_number").on(table.passNumber),
    index("idx_vc_passes_status").on(table.status),
  ]
);

// 6. vc_access_events — Turnstile, boom barrier & reader audit events
export const vcAccessEvents = pgTable(
  "vc_access_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    passId: uuid("pass_id").references(() => vcAccessPasses.id, { onDelete: "set null" }),
    visitorId: uuid("visitor_id").references(() => vcVisitors.id, { onDelete: "set null" }),
    visitId: uuid("visit_id").references(() => vcVisits.id, { onDelete: "set null" }),
    accessPoint: varchar("access_point", { length: 255 }).notNull(),
    direction: varchar("direction", { length: 20 }).notNull(), // in, out
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
    sourceSystem: varchar("source_system", { length: 100 }).default("turnstile_qr"),
    result: varchar("result", { length: 50 }).default("granted").notNull(), // granted, denied_expired, denied_zone, denied_watchlist
  },
  (table) => [
    index("idx_vc_events_visitor").on(table.visitorId),
    index("idx_vc_events_time").on(table.timestamp),
  ]
);

// 7. vc_watchlist — Blacklist / restricted persons register
export const vcWatchlist = pgTable(
  "vc_watchlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: varchar("org_id", { length: 100 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    mobile: varchar("mobile", { length: 50 }),
    email: varchar("email", { length: 255 }),
    identityReference: varchar("identity_reference", { length: 100 }),
    reason: text("reason").notNull(),
    severity: varchar("severity", { length: 20 }).default("high").notNull(), // low, medium, high, critical
    activeFrom: timestamp("active_from", { withTimezone: true }).defaultNow().notNull(),
    activeTo: timestamp("active_to", { withTimezone: true }),
    approvalStatus: varchar("approval_status", { length: 50 }).default("active").notNull(),
    createdBy: varchar("created_by", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vc_watchlist_org").on(table.orgId),
    index("idx_vc_watchlist_mobile").on(table.mobile),
  ]
);

// 8. cm_obligations — Master register of compliance obligations
export const cmObligations = pgTable(
  "cm_obligations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: varchar("org_id", { length: 100 }).notNull(),
    propertyId: varchar("property_id", { length: 100 }),
    propertyName: varchar("property_name", { length: 255 }),
    category: varchar("category", { length: 100 }).notNull(), // statutory, fire_safety, environmental, labor_law, structural, hvac_lift, vendor_contract, insurance
    subcategory: varchar("subcategory", { length: 100 }),
    authority: varchar("authority", { length: 255 }),
    requirement: text("requirement").notNull(),
    frequency: varchar("frequency", { length: 50 }).notNull(), // monthly, quarterly, half_yearly, annual, triennial, one_time
    ownerId: varchar("owner_id", { length: 100 }),
    ownerName: varchar("owner_name", { length: 255 }),
    criticality: varchar("criticality", { length: 20 }).default("medium").notNull(), // low, medium, high, critical
    evidenceRequired: boolean("evidence_required").default(true).notNull(),
    status: varchar("status", { length: 50 }).default("compliant").notNull(), // compliant, due_soon, overdue, critical_overdue, in_progress, waived
    nextDueDate: date("next_due_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_obligations_org").on(table.orgId),
    index("idx_cm_obligations_category").on(table.category),
    index("idx_cm_obligations_status").on(table.status),
    index("idx_cm_obligations_due").on(table.nextDueDate),
  ]
);

// 9. cm_schedules — Recurring schedules for obligations
export const cmSchedules = pgTable(
  "cm_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    obligationId: uuid("obligation_id").references(() => cmObligations.id, { onDelete: "cascade" }),
    dueDate: date("due_date").notNull(),
    reminderDays: integer("reminder_days").default(15),
    recurrenceRule: varchar("recurrence_rule", { length: 100 }),
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, completed, overdue, extended
    extendedTo: date("extended_to"),
    extensionReason: text("extension_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_schedules_obligation").on(table.obligationId),
    index("idx_cm_schedules_due").on(table.dueDate),
  ]
);

// 10. cm_evidence — Document proof, certificates & test reports
export const cmEvidence = pgTable(
  "cm_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    obligationId: uuid("obligation_id").references(() => cmObligations.id, { onDelete: "cascade" }),
    documentName: varchar("document_name", { length: 255 }).notNull(),
    documentUrl: text("document_url").notNull(),
    issueDate: date("issue_date"),
    expiryDate: date("expiry_date"),
    verificationStatus: varchar("verification_status", { length: 50 }).default("verified").notNull(), // pending, verified, rejected, expired
    verifiedBy: varchar("verified_by", { length: 255 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_evidence_obligation").on(table.obligationId),
    index("idx_cm_evidence_expiry").on(table.expiryDate),
  ]
);

// 11. cm_inspections — Site audits and scheduled safety checks
export const cmInspections = pgTable(
  "cm_inspections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: varchar("property_id", { length: 100 }),
    propertyName: varchar("property_name", { length: 255 }),
    assetId: varchar("asset_id", { length: 100 }),
    vendorId: varchar("vendor_id", { length: 100 }),
    type: varchar("type", { length: 100 }).notNull(), // fire_safety_audit, lift_check, electrical_safety, hvac_air_quality, structural_audit, security_audit
    title: varchar("title", { length: 255 }).notNull(),
    scheduledDate: date("scheduled_date").notNull(),
    conductedDate: date("conducted_date"),
    inspectorId: varchar("inspector_id", { length: 100 }),
    inspectorName: varchar("inspector_name", { length: 255 }),
    status: varchar("status", { length: 50 }).default("scheduled").notNull(), // scheduled, in_progress, completed, passed, failed
    score: numeric("score", { precision: 5, scale: 2 }),
    checklist: jsonb("checklist").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_inspections_property").on(table.propertyId),
    index("idx_cm_inspections_status").on(table.status),
  ]
);

// 12. cm_findings — Findings and snags discovered in inspections
export const cmFindings = pgTable(
  "cm_findings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inspectionId: uuid("inspection_id").references(() => cmInspections.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 100 }),
    severity: varchar("severity", { length: 20 }).default("medium").notNull(), // low, medium, high, critical
    observation: text("observation").notNull(),
    location: varchar("location", { length: 255 }),
    photoUrl: text("photo_url"),
    capaId: uuid("capa_id"),
    status: varchar("status", { length: 50 }).default("open").notNull(), // open, resolved, closed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_findings_inspection").on(table.inspectionId),
    index("idx_cm_findings_status").on(table.status),
  ]
);

// 13. cm_incidents — EHS and security incident log
export const cmIncidents = pgTable(
  "cm_incidents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: varchar("property_id", { length: 100 }),
    propertyName: varchar("property_name", { length: 255 }),
    location: varchar("location", { length: 255 }).notNull(),
    incidentType: varchar("incident_type", { length: 100 }).notNull(), // safety, fire_alarm, security_breach, water_leak, power_outage, medical, equipment_failure
    severity: varchar("severity", { length: 20 }).default("medium").notNull(), // low, medium, high, critical
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    reportedAt: timestamp("reported_at", { withTimezone: true }).defaultNow().notNull(),
    reportedBy: varchar("reported_by", { length: 255 }),
    personsInvolved: text("persons_involved"),
    description: text("description").notNull(),
    immediateAction: text("immediate_action"),
    capaId: uuid("capa_id"),
    status: varchar("status", { length: 50 }).default("reported").notNull(), // reported, investigating, action_in_progress, resolved, closed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_incidents_property").on(table.propertyId),
    index("idx_cm_incidents_severity").on(table.severity),
    index("idx_cm_incidents_status").on(table.status),
  ]
);

// 14. cm_capa — Corrective and Preventive Actions
export const cmCapa = pgTable(
  "cm_capa",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceType: varchar("source_type", { length: 50 }).notNull(), // inspection, incident, audit, manual
    sourceId: varchar("source_id", { length: 100 }),
    title: varchar("title", { length: 255 }).notNull(),
    actionType: varchar("action_type", { length: 50 }).notNull(), // corrective, preventive
    action: text("action").notNull(),
    ownerId: varchar("owner_id", { length: 100 }),
    ownerName: varchar("owner_name", { length: 255 }).notNull(),
    dueDate: date("due_date").notNull(),
    priority: varchar("priority", { length: 20 }).default("high").notNull(), // low, medium, high, critical
    evidenceUrl: text("evidence_url"),
    verificationStatus: varchar("verification_status", { length: 50 }).default("pending").notNull(), // pending, verified, rejected
    status: varchar("status", { length: 50 }).default("open").notNull(), // open, in_progress, pending_verification, closed
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_capa_status").on(table.status),
    index("idx_cm_capa_due").on(table.dueDate),
  ]
);

// 15. cm_permits — Work permits for hazardous/contractor tasks
export const cmPermits = pgTable(
  "cm_permits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: varchar("property_id", { length: 100 }),
    propertyName: varchar("property_name", { length: 255 }),
    permitNumber: varchar("permit_number", { length: 100 }).unique().notNull(),
    vendorId: varchar("vendor_id", { length: 100 }),
    contractorName: varchar("contractor_name", { length: 255 }).notNull(),
    permitType: varchar("permit_type", { length: 100 }).notNull(), // hot_work, height, electrical, confined_space, chemical, maintenance
    riskControls: text("risk_controls"),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validTo: timestamp("valid_to", { withTimezone: true }).notNull(),
    approverId: varchar("approver_id", { length: 100 }),
    approverName: varchar("approver_name", { length: 255 }),
    status: varchar("status", { length: 50 }).default("approved").notNull(), // draft, pending, approved, active, completed, revoked, expired
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_permits_number").on(table.permitNumber),
    index("idx_cm_permits_status").on(table.status),
  ]
);

// 16. cm_risks — Facility & operational risk register
export const cmRisks = pgTable(
  "cm_risks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: varchar("property_id", { length: 100 }),
    propertyName: varchar("property_name", { length: 255 }),
    category: varchar("category", { length: 100 }).notNull(), // fire_life_safety, statutory, operational, environmental, vendor, security
    statement: text("statement").notNull(),
    likelihood: integer("likelihood").notNull(), // 1 to 5
    impact: integer("impact").notNull(), // 1 to 5
    inherentScore: integer("inherent_score").notNull(), // likelihood * impact
    mitigation: text("mitigation").notNull(),
    residualLikelihood: integer("residual_likelihood"),
    residualImpact: integer("residual_impact"),
    residualScore: integer("residual_score"),
    ownerName: varchar("owner_name", { length: 255 }),
    status: varchar("status", { length: 50 }).default("active").notNull(), // active, mitigated, accepted, closed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_risks_category").on(table.category),
    index("idx_cm_risks_status").on(table.status),
  ]
);

// 17. cm_audit_findings — Audit observations & non-conformances
export const cmAuditFindings = pgTable(
  "cm_audit_findings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditId: varchar("audit_id", { length: 100 }).notNull(),
    propertyName: varchar("property_name", { length: 255 }),
    severity: varchar("severity", { length: 20 }).default("high").notNull(), // low, medium, high, critical
    finding: text("finding").notNull(),
    clauseReference: varchar("clause_reference", { length: 100 }),
    ownerName: varchar("owner_name", { length: 255 }),
    dueDate: date("due_date"),
    capaId: uuid("capa_id"),
    closureStatus: varchar("closure_status", { length: 50 }).default("open").notNull(), // open, in_progress, closed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cm_audit_audit").on(table.auditId),
    index("idx_cm_audit_status").on(table.closureStatus),
  ]
);

// 18. vc_subscriptions — SaaS Subscriptions (₹999/mo, Razorpay, Coupons)
export const vcSubscriptions = pgTable(
  "vc_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: varchar("org_id", { length: 100 }).notNull(),
    orgName: varchar("org_name", { length: 255 }).notNull(),
    planName: varchar("plan_name", { length: 100 }).default("Commercial Pass").notNull(),
    billingCycle: varchar("billing_cycle", { length: 50 }).default("monthly").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // 999.00 or 0.00
    currency: varchar("currency", { length: 10 }).default("INR").notNull(),
    couponCode: varchar("coupon_code", { length: 50 }),
    discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
    razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
    razorpaySignature: text("razorpay_signature"),
    status: varchar("status", { length: 50 }).default("active").notNull(), // active, trial, past_due, cancelled
    startsAt: timestamp("starts_at", { withTimezone: true }).defaultNow().notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vc_subs_org").on(table.orgId),
    index("idx_vc_subs_status").on(table.status),
  ]
);

// 19. vc_settings — Organization settings & templates
export const vcSettings = pgTable(
  "vc_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: varchar("org_id", { length: 100 }).unique().notNull(),
    visitorTypes: jsonb("visitor_types").default([
      "Guest",
      "Client",
      "Interview Candidate",
      "Contractor",
      "Vendor",
      "Delivery Partner",
      "VIP",
      "Emergency"
    ]),
    accessZones: jsonb("access_zones").default([
      "Tower Lobby",
      "Floor 1 to 5",
      "Server Room",
      "Cafeteria",
      "Basement Parking",
      "Terrace"
    ]),
    approvalRules: jsonb("approval_rules").default({
      require_host_approval: true,
      auto_approve_vip: true,
      max_visit_hours: 8
    }),
    badgeTemplate: jsonb("badge_template").default({
      theme: "dark",
      show_qr: true,
      show_photo: true,
      show_zone: true
    }),
    notificationChannels: jsonb("notification_channels").default({
      email: true,
      sms: true,
      whatsapp: false
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vc_settings_org").on(table.orgId),
  ]
);

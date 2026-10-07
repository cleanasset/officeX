import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
  date,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================================================
// OFFICEX Rent Roll — Phase P0 Schema Specification (Lease-to-Cash SaaS)
// Conforming strictly to:
// - Document 1: OFFICEX_Rent_Roll_Final_Implementation_Document_V2.1_Scalezix.docx (§4)
// - Document 2: OFFICEX_Rent_Roll_Screen_by_Screen_UX_Specification_V1.0_Scalezix.docx
//
// Rules enforced:
// 1. All field names are exact snake_case.
// 2. Exact field names matching specification without aliasing.
// 3. Strict Phase P0 scope.
// 4. Common audit & system fields on every table (§4.3).
// 5. client_account_id present on every Rent Roll table for multi-tenancy.
// 6. No hard-coded values — driven by config tables (charge_type, tax_profile).
// 7. Standalone: No dependency on CAFM, CRM, or Marketplace.
// ============================================================================

// ----------------------------------------------------------------------------
// ENUMS (19 P0 Domain Enums)
// ----------------------------------------------------------------------------

// §4.4: organization subscription status
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "suspended",
  "cancelled",
]);

// §4.5: property types
export const propertyTypeEnum = pgEnum("property_type", [
  "office",
  "residential",
  "retail",
  "flex_workspace",
  "mixed",
]);

// §4.5: space hierarchy types
export const spaceTypeEnum = pgEnum("space_type", [
  "entire_building",
  "floor",
  "wing",
  "suite",
  "cabin",
  "desk",
  "parking",
]);

// §4.5: area measurement unit
export const areaUnitEnum = pgEnum("area_unit", ["sqft", "sqm"]);

// §4.5: space occupancy state
export const occupancyStatusEnum = pgEnum("occupancy_status", [
  "vacant",
  "occupied",
  "under_maintenance",
  "retired",
]);

// §4.6: occupant entity legal type
export const occupantTypeEnum = pgEnum("occupant_type", [
  "individual",
  "company",
  "partnership",
  "trust",
]);

// §4.6: occupant relationship lifecycle status
export const occupantStatusEnum = pgEnum("occupant_status", [
  "active",
  "notice_served",
  "holding_over",
  "vacant",
  "inactive",
]);

// §4.7: core contract agreement type
export const contractTypeEnum = pgEnum("contract_type", [
  "lease",
  "leave_and_licence",
  "managed_office_agreement",
  "co_working_membership",
  "service_charge_agreement",
  "head_lease",
]);

// §4.7: cashflow direction (receivable vs payable)
export const directionEnum = pgEnum("direction", ["receivable", "payable"]);

// §4.7: invoice calculation model
export const billingModelEnum = pgEnum("billing_model", [
  "area",
  "seats",
  "fixed",
  "hybrid",
]);

// §4.7, §4.13: contract lifecycle status
export const contractStatusEnum = pgEnum("contract_status", [
  "draft",
  "future",
  "active",
  "notice_served",
  "holding_over",
  "expired",
  "terminated",
]);

// §4.7: financial approval status workflow
export const approvalStatusEnum = pgEnum("approval_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
]);

// §4.7: security deposit status
export const depositStatusEnum = pgEnum("deposit_status", [
  "pending",
  "received",
  "adjusted",
  "refunded",
]);

// §4.8: revenue/recovery charge category
export const chargeCategoryEnum = pgEnum("charge_category", [
  "base_rent",
  "recovery",
  "service_charge",
  "utility",
  "deposit",
  "deposit_return",
  "credit_note",
  "concession",
]);

// §4.8: tax jurisdiction classification
export const taxTypeEnum = pgEnum("tax_type", ["gst", "vat", "other"]);

// §4.4: legal billing entity type
export const entityTypeEnum = pgEnum("entity_type", [
  "owner",
  "property_manager",
  "fm_company",
  "operator",
]);

// §4.4: property management fee structure
export const feeStructureEnum = pgEnum("fee_structure", [
  "percentage",
  "fixed",
  "hybrid",
]);

// §4.4: property management fee billing cadence
export const feeFrequencyEnum = pgEnum("fee_frequency", [
  "monthly",
  "quarterly",
  "annual",
]);

// §4.7A: deal pipeline stage
export const dealStageEnum = pgEnum("deal_stage", [
  "lead",
  "site_visit",
  "proposal",
  "loi",
  "agreement_drafting",
  "won",
  "lost",
]);

// --- PHASE P1 ENUMS (§4.8, §4.9, §4.10) ---

// §4.8: contract charge calculation basis
export const chargeCalcBasisEnum = pgEnum("charge_calc_basis", [
  "per_area",
  "per_seat",
  "fixed",
  "per_slot",
  "metered",
  "pro_rata_share",
  "pct_of_turnover",
  "per_use",
]);

// §4.8: billing mode (advance vs arrears)
export const billingModeEnum = pgEnum("billing_mode", ["advance", "arrears"]);

// §4.8: escalation calculation structure
export const escalationTypeEnum = pgEnum("escalation_type", [
  "initial",
  "percentage",
  "fixed_amount",
  "index_based",
  "market_review",
  "stepped_schedule",
]);

// §4.8: rent step schedule status
export const rentStepStatusEnum = pgEnum("rent_step_status", [
  "scheduled",
  "due",
  "applied",
  "pending_resolution",
  "disputed",
]);

// §4.8: concession type
export const concessionTypeEnum = pgEnum("concession_type", [
  "rent_free",
  "fitout_contribution",
  "discount_pct",
  "discount_amount",
  "capex_by_landlord",
]);

// §4.8: contract statutory/commercial clause type
export const clauseTypeEnum = pgEnum("clause_type", [
  "lock_in",
  "notice",
  "renewal_option",
  "break_option",
  "rofr",
  "rofo",
  "expansion",
  "exclusivity",
  "subletting",
  "reinstatement",
]);

// §4.8: clause fulfillment status
export const clauseStatusEnum = pgEnum("clause_status", [
  "open",
  "exercised",
  "lapsed",
  "waived",
]);

// §4.9: contract document type
export const docTypeEnum = pgEnum("doc_type", [
  "term_sheet",
  "loi",
  "lease_agreement",
  "leave_and_licence",
  "amendment",
  "renewal_agreement",
  "termination",
  "possession_letter",
  "deposit_receipt",
  "noc",
  "insurance",
  "fitout",
  "other",
]);

// §4.9: document execution status
export const docStatusEnum = pgEnum("doc_status", [
  "draft",
  "under_review",
  "approved",
  "signed",
  "executed",
  "expired",
  "superseded",
]);

// §4.9: document visibility level
export const docVisibilityEnum = pgEnum("doc_visibility", [
  "internal",
  "client_visible",
  "occupant_visible",
]);

// §4.10, §5.14: workflow task type
export const taskTypeEnum = pgEnum("task_type", [
  "contract_approval",
  "escalation_due",
  "expiry_renewal",
  "document_missing",
  "dispute_followup",
]);

// §4.10, §5.14: workflow task status
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
]);

// §4.10, §5.14: workflow task priority
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);


// ============================================================================
// 1. ORGANIZATION (§4.4 Platform Core)
// Root subscriber organization anchoring multi-tenancy and RLS
// ============================================================================
export const organization = pgTable(
  "organization",
  {
    // organization.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // organization.org_id — from §4.3 (root self/null anchor for universal audit compliance)
    org_id: uuid("org_id"),
    // organization.client_account_id — from §4.3 (nullable for portfolio-wide)
    client_account_id: uuid("client_account_id"),
    // organization.name — from §4.4
    name: text("name").notNull(),
    // organization.slug — from §4.4
    slug: text("slug").unique().notNull(),
    // organization.subscription_status — from §4.4
    subscription_status: subscriptionStatusEnum("subscription_status")
      .default("active")
      .notNull(),
    // organization.workspace_name — from §4.4
    workspace_name: text("workspace_name"),

    // Common Audit & System Fields (§4.3)
    // organization.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // organization.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // organization.created_by — from §4.3
    created_by: uuid("created_by"),
    // organization.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // organization.version — from §4.3
    version: integer("version").default(1).notNull(),
    // organization.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // organization.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // organization.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("organization_slug_idx").on(table.slug),
    index("organization_subscription_status_idx").on(table.subscription_status),
  ]
);

// ============================================================================
// 2. CLIENT_ACCOUNT (§4.4 Operator Layer)
// Owner portfolios managed by operator; single-owner uses auto 'is_self'
// ============================================================================
export const client_account = pgTable(
  "client_account",
  {
    // client_account.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // client_account.org_id — from §4.3, §4.4
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // client_account.client_account_id — from §4.3 (self-scope anchor)
    client_account_id: uuid("client_account_id"),
    // client_account.client_name — from §4.4
    client_name: text("client_name").notNull(),
    // client_account.client_code — from §4.4
    client_code: text("client_code").notNull(),
    // client_account.is_self — from §4.4
    is_self: boolean("is_self").default(true).notNull(),
    // client_account.owner_party_id — from §4.4 (FK to occupant party)
    owner_party_id: uuid("owner_party_id").references((): any => occupant.id, {
      onDelete: "set null",
    }),
    // client_account.billing_entity_id — from §4.4 (FK to billing_entity)
    billing_entity_id: uuid("billing_entity_id").references(
      (): any => billing_entity.id,
      { onDelete: "set null" }
    ),
    // client_account.management_mandate — from §4.4 (principal amount, fee %, fee type)
    management_mandate: jsonb("management_mandate"),

    // Common Audit & System Fields (§4.3)
    // client_account.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // client_account.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // client_account.created_by — from §4.3
    created_by: uuid("created_by"),
    // client_account.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // client_account.version — from §4.3
    version: integer("version").default(1).notNull(),
    // client_account.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // client_account.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // client_account.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("client_account_org_client_code_idx").on(
      table.org_id,
      table.client_code
    ),
    index("client_account_org_id_idx").on(table.org_id),
    index("client_account_owner_party_id_idx").on(table.owner_party_id),
    index("client_account_billing_entity_id_idx").on(table.billing_entity_id),
  ]
);

// ============================================================================
// 3. PROPERTY (§4.5 Space Masters)
// Real estate commercial asset / development master
// ============================================================================
export const property = pgTable(
  "property",
  {
    // property.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // property.org_id — from §4.3, §4.5
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // property.client_account_id — from §4.3, §4.5
    client_account_id: uuid("client_account_id")
      .notNull()
      .references(() => client_account.id, { onDelete: "cascade" }),
    // property.property_name — from §4.5
    property_name: text("property_name").notNull(),
    // property.property_code — from §4.5
    property_code: text("property_code").notNull(),
    // property.address — from §4.5
    address: text("address"),
    // property.city — from §4.5
    city: text("city"),
    // property.state — from §4.5
    state: text("state"),
    // property.postal_code — from §4.5
    postal_code: text("postal_code"),
    // property.country_code — from §4.5
    country_code: text("country_code").default("IN"),
    // property.total_leasable_area_sqft — from §4.5
    total_leasable_area_sqft: numeric("total_leasable_area_sqft", {
      precision: 14,
      scale: 2,
    }).notNull(),
    // property.total_leasable_seats — from §4.5
    total_leasable_seats: integer("total_leasable_seats"),
    // property.timezone — from §4.3, §4.5
    timezone: text("timezone").default("Asia/Kolkata"),
    // property.property_type — from §4.5
    property_type: propertyTypeEnum("property_type"),

    // Common Audit & System Fields (§4.3)
    // property.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // property.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // property.created_by — from §4.3
    created_by: uuid("created_by"),
    // property.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // property.version — from §4.3
    version: integer("version").default(1).notNull(),
    // property.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // property.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // property.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("property_org_property_code_idx").on(
      table.org_id,
      table.property_code
    ),
    index("property_org_id_idx").on(table.org_id),
    index("property_client_account_id_idx").on(table.client_account_id),
    index("property_property_type_idx").on(table.property_type),
  ]
);

// ============================================================================
// 4. BUILDING (§4.5 Space Masters)
// Individual tower/block within a campus or single property
// ============================================================================
export const building = pgTable(
  "building",
  {
    // building.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // building.org_id — from §4.3, §4.5
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // building.client_account_id — from §4.3, §4.5
    client_account_id: uuid("client_account_id")
      .notNull()
      .references(() => client_account.id, { onDelete: "cascade" }),
    // building.property_id — from §4.5
    property_id: uuid("property_id")
      .notNull()
      .references(() => property.id, { onDelete: "cascade" }),
    // building.building_name — from §4.5
    building_name: text("building_name").notNull(),
    // building.building_code — from §4.5
    building_code: text("building_code").notNull(),
    // building.address — from §4.5
    address: text("address"),
    // building.floors — from §4.5
    floors: integer("floors"),
    // building.total_area_sqft — from §4.5
    total_area_sqft: numeric("total_area_sqft", { precision: 14, scale: 2 }),
    // building.total_seats — from §4.5
    total_seats: integer("total_seats"),

    // Common Audit & System Fields (§4.3)
    // building.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // building.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // building.created_by — from §4.3
    created_by: uuid("created_by"),
    // building.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // building.version — from §4.3
    version: integer("version").default(1).notNull(),
    // building.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // building.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // building.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("building_property_building_code_idx").on(
      table.property_id,
      table.building_code
    ),
    index("building_org_id_idx").on(table.org_id),
    index("building_client_account_id_idx").on(table.client_account_id),
    index("building_property_id_idx").on(table.property_id),
  ]
);

// ============================================================================
// 5. SPACE (§4.5 Space Masters)
// Demised premises, suite, floor, cabin, desk or parking slot
// ============================================================================
export const space = pgTable(
  "space",
  {
    // space.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // space.org_id — from §4.3, §4.5
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // space.client_account_id — from §4.3, §4.5
    client_account_id: uuid("client_account_id")
      .notNull()
      .references(() => client_account.id, { onDelete: "cascade" }),
    // space.building_id — from §4.5
    building_id: uuid("building_id")
      .notNull()
      .references(() => building.id, { onDelete: "cascade" }),
    // space.space_code — from §4.5
    space_code: text("space_code").notNull(),
    // space.space_name — from §4.5
    space_name: text("space_name").notNull(),
    // space.floor_name — from §4.5
    floor_name: text("floor_name"),
    // space.space_type — from §4.5
    space_type: spaceTypeEnum("space_type"),
    // space.chargeable_area_sqft — from §4.5
    chargeable_area_sqft: numeric("chargeable_area_sqft", {
      precision: 14,
      scale: 2,
    }).notNull(),
    // space.carpet_area_sqft — from §4.5
    carpet_area_sqft: numeric("carpet_area_sqft", { precision: 14, scale: 2 }),
    // space.super_area_sqft — from §4.5
    super_area_sqft: numeric("super_area_sqft", { precision: 14, scale: 2 }),
    // space.area_unit — from §4.5
    area_unit: areaUnitEnum("area_unit").default("sqft"),
    // space.is_leasable — from §4.5
    is_leasable: boolean("is_leasable").default(true).notNull(),
    // space.occupancy_status — from §4.5
    occupancy_status: occupancyStatusEnum("occupancy_status")
      .default("vacant")
      .notNull(),

    // Common Audit & System Fields (§4.3)
    // space.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // space.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // space.created_by — from §4.3
    created_by: uuid("created_by"),
    // space.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // space.version — from §4.3
    version: integer("version").default(1).notNull(),
    // space.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // space.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // space.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("space_building_space_code_idx").on(
      table.building_id,
      table.space_code
    ),
    index("space_org_id_idx").on(table.org_id),
    index("space_client_account_id_idx").on(table.client_account_id),
    index("space_building_id_idx").on(table.building_id),
    index("space_space_type_idx").on(table.space_type),
    index("space_occupancy_status_idx").on(table.occupancy_status),
  ]
);

// ============================================================================
// 6. OCCUPANT (§4.6 Parties)
// Tenant, licensee, member or landlord party (payable head leases)
// ============================================================================
export const occupant = pgTable(
  "occupant",
  {
    // occupant.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // occupant.org_id — from §4.3, §4.6
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // occupant.client_account_id — from §4.3, §4.6 (nullable for tenant)
    client_account_id: uuid("client_account_id").references(
      (): any => client_account.id,
      { onDelete: "set null" }
    ),
    // occupant.occupant_code — from §4.6
    occupant_code: text("occupant_code").notNull(),
    // occupant.occupant_name — from §4.6
    occupant_name: text("occupant_name").notNull(),
    // occupant.occupant_type — from §4.6
    occupant_type: occupantTypeEnum("occupant_type")
      .default("company")
      .notNull(),
    // occupant.email — from §4.6
    email: text("email"),
    // occupant.phone — from §4.6
    phone: text("phone"),
    // occupant.gst_number — from §4.6
    gst_number: text("gst_number"),
    // occupant.pan_number — from §4.6
    pan_number: text("pan_number"),
    // occupant.address — from §4.6
    address: text("address"),
    // occupant.city — from §4.6
    city: text("city"),
    // occupant.state — from §4.6
    state: text("state"),
    // occupant.postal_code — from §4.6
    postal_code: text("postal_code"),
    // occupant.industry_sector — from §4.6
    industry_sector: text("industry_sector"),
    // occupant.is_critical_occupant — from §4.6
    is_critical_occupant: boolean("is_critical_occupant")
      .default(false)
      .notNull(),
    // occupant.occupant_status — from §4.6
    occupant_status: occupantStatusEnum("occupant_status")
      .default("active")
      .notNull(),

    // Common Audit & System Fields (§4.3)
    // occupant.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // occupant.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // occupant.created_by — from §4.3
    created_by: uuid("created_by"),
    // occupant.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // occupant.version — from §4.3
    version: integer("version").default(1).notNull(),
    // occupant.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // occupant.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // occupant.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("occupant_org_occupant_code_idx").on(
      table.org_id,
      table.occupant_code
    ),
    index("occupant_org_id_idx").on(table.org_id),
    index("occupant_client_account_id_idx").on(table.client_account_id),
    index("occupant_occupant_status_idx").on(table.occupant_status),
    index("occupant_occupant_type_idx").on(table.occupant_type),
  ]
);

// ============================================================================
// 7. CONTRACT (§4.7 Contract Layer)
// Core legal instrument for all lease deeds, licences, memberships, and head leases
// ============================================================================
export const contract = pgTable(
  "contract",
  {
    // contract.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // contract.org_id — from §4.3, §4.7
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // contract.client_account_id — from §4.3, §4.7
    client_account_id: uuid("client_account_id")
      .notNull()
      .references(() => client_account.id, { onDelete: "cascade" }),
    // contract.space_id — from §4.7
    space_id: uuid("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "restrict" }),
    // contract.occupant_id — from §4.7
    occupant_id: uuid("occupant_id")
      .notNull()
      .references(() => occupant.id, { onDelete: "restrict" }),
    // contract.contract_code — from §4.7
    contract_code: text("contract_code").notNull(),
    // contract.contract_type — from §4.7
    contract_type: contractTypeEnum("contract_type").notNull(),
    // contract.direction — from §4.7
    direction: directionEnum("direction").default("receivable").notNull(),
    // contract.billing_model — from §4.7
    billing_model: billingModelEnum("billing_model").notNull(),
    // contract.contract_status — from §4.7, §4.13
    contract_status: contractStatusEnum("contract_status")
      .default("draft")
      .notNull(),
    // contract.approval_status — from §4.7
    approval_status: approvalStatusEnum("approval_status")
      .default("draft")
      .notNull(),
    // contract.start_date — from §4.7
    start_date: date("start_date").notNull(),
    // contract.end_date — from §4.7
    end_date: date("end_date").notNull(),
    // contract.renewal_date — from §4.7
    renewal_date: date("renewal_date"),
    // contract.notice_period_days — from §4.7
    notice_period_days: integer("notice_period_days"),
    // contract.deposit_amount_inr — from §4.7
    deposit_amount_inr: numeric("deposit_amount_inr", {
      precision: 14,
      scale: 2,
    }),
    // contract.deposit_status — from §4.7
    deposit_status: depositStatusEnum("deposit_status").default("pending"),
    // contract.lock_in_period_days — from §4.7
    lock_in_period_days: integer("lock_in_period_days"),
    // contract.is_evergreen — from §4.7
    is_evergreen: boolean("is_evergreen").default(false).notNull(),
    // contract.commencement_date — from §4.7
    commencement_date: date("commencement_date"),
    // contract.execution_date — from §4.7
    execution_date: date("execution_date"),
    // contract.is_template — from §4.7
    is_template: boolean("is_template").default(false).notNull(),
    // contract.alternate_address — from §4.7
    alternate_address: text("alternate_address"),
    // contract.remarks — from §4.7
    remarks: text("remarks"),

    // Common Audit & System Fields (§4.3)
    // contract.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // contract.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // contract.created_by — from §4.3
    created_by: uuid("created_by"),
    // contract.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // contract.version — from §4.3
    version: integer("version").default(1).notNull(),
    // contract.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // contract.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // contract.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("contract_org_contract_code_idx").on(
      table.org_id,
      table.contract_code
    ),
    index("contract_org_id_idx").on(table.org_id),
    index("contract_client_account_id_idx").on(table.client_account_id),
    index("contract_space_id_idx").on(table.space_id),
    index("contract_occupant_id_idx").on(table.occupant_id),
    index("contract_contract_status_idx").on(table.contract_status),
    index("contract_approval_status_idx").on(table.approval_status),
    index("contract_contract_type_idx").on(table.contract_type),
    index("contract_dates_idx").on(table.start_date, table.end_date),
  ]
);

// ============================================================================
// 8. CONTRACT_SPACE (§4.7 Join Table)
// Multi-space allocations, phased expansions, and mid-term surrenders
// ============================================================================
export const contract_space = pgTable(
  "contract_space",
  {
    // contract_space.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // contract_space.org_id — from §4.3, §4.7
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // contract_space.client_account_id — from §4.3, §4.7
    client_account_id: uuid("client_account_id")
      .notNull()
      .references(() => client_account.id, { onDelete: "cascade" }),
    // contract_space.contract_id — from §4.7
    contract_id: uuid("contract_id")
      .notNull()
      .references(() => contract.id, { onDelete: "cascade" }),
    // contract_space.space_id — from §4.7
    space_id: uuid("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "restrict" }),
    // contract_space.area_allocated_sqft — from §4.7
    area_allocated_sqft: numeric("area_allocated_sqft", {
      precision: 14,
      scale: 2,
    }),
    // contract_space.seats_allocated — from §4.7
    seats_allocated: integer("seats_allocated"),
    // contract_space.index_order — from §4.7
    index_order: integer("index_order"),

    // Common Audit & System Fields (§4.3)
    // contract_space.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // contract_space.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // contract_space.created_by — from §4.3
    created_by: uuid("created_by"),
    // contract_space.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // contract_space.version — from §4.3
    version: integer("version").default(1).notNull(),
    // contract_space.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // contract_space.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // contract_space.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("contract_space_unique_idx").on(
      table.contract_id,
      table.space_id
    ),
    index("contract_space_org_id_idx").on(table.org_id),
    index("contract_space_client_account_id_idx").on(table.client_account_id),
    index("contract_space_contract_id_idx").on(table.contract_id),
    index("contract_space_space_id_idx").on(table.space_id),
  ]
);

// ============================================================================
// 9. CHARGE_TYPE (§4.8 Configuration Table)
// Master dictionary for billable line items (RENT, CAM, DG, PARKING, etc.)
// ============================================================================
export const charge_type = pgTable(
  "charge_type",
  {
    // charge_type.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // charge_type.org_id — from §4.3, §4.8
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // charge_type.client_account_id — from §4.3, §4.8 (nullable for portfolio-wide)
    client_account_id: uuid("client_account_id").references(
      (): any => client_account.id,
      { onDelete: "set null" }
    ),
    // charge_type.charge_code — from §4.8
    charge_code: text("charge_code").notNull(),
    // charge_type.charge_name — from §4.8
    charge_name: text("charge_name").notNull(),
    // charge_type.charge_category — from §4.8
    charge_category: chargeCategoryEnum("charge_category").notNull(),
    // charge_type.is_taxable — from §4.8
    is_taxable: boolean("is_taxable").default(false).notNull(),
    // charge_type.is_recurring — from §4.8
    is_recurring: boolean("is_recurring").default(true).notNull(),
    // charge_type.is_active — from §4.8
    is_active: boolean("is_active").default(true).notNull(),

    // Common Audit & System Fields (§4.3)
    // charge_type.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // charge_type.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // charge_type.created_by — from §4.3
    created_by: uuid("created_by"),
    // charge_type.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // charge_type.version — from §4.3
    version: integer("version").default(1).notNull(),
    // charge_type.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // charge_type.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // charge_type.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("charge_type_org_charge_code_idx").on(
      table.org_id,
      table.charge_code
    ),
    index("charge_type_org_id_idx").on(table.org_id),
    index("charge_type_client_account_id_idx").on(table.client_account_id),
    index("charge_type_charge_category_idx").on(table.charge_category),
    index("charge_type_is_active_idx").on(table.is_active),
  ]
);

// ============================================================================
// 10. TAX_PROFILE (§4.8 Configuration Table)
// GST/VAT rate definitions preventing hardcoded tax numbers
// ============================================================================
export const tax_profile = pgTable(
  "tax_profile",
  {
    // tax_profile.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // tax_profile.org_id — from §4.3, §4.8
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // tax_profile.client_account_id — from §4.3, §4.8 (nullable for portfolio-wide)
    client_account_id: uuid("client_account_id").references(
      (): any => client_account.id,
      { onDelete: "set null" }
    ),
    // tax_profile.tax_name — from §4.8
    tax_name: text("tax_name").notNull(),
    // tax_profile.tax_type — from §4.8
    tax_type: taxTypeEnum("tax_type").default("gst").notNull(),
    // tax_profile.tax_rate_percent — from §4.8
    tax_rate_percent: numeric("tax_rate_percent", {
      precision: 5,
      scale: 2,
    }).notNull(),
    // tax_profile.is_active — from §4.8
    is_active: boolean("is_active").default(true).notNull(),

    // Common Audit & System Fields (§4.3)
    // tax_profile.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // tax_profile.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // tax_profile.created_by — from §4.3
    created_by: uuid("created_by"),
    // tax_profile.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // tax_profile.version — from §4.3
    version: integer("version").default(1).notNull(),
    // tax_profile.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // tax_profile.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // tax_profile.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    index("tax_profile_org_id_idx").on(table.org_id),
    index("tax_profile_client_account_id_idx").on(table.client_account_id),
    index("tax_profile_tax_type_idx").on(table.tax_type),
    index("tax_profile_is_active_idx").on(table.is_active),
  ]
);

// ============================================================================
// 11. BILLING_ENTITY (§4.4 Operator & Billing Layer)
// Legal entity issuing invoices (SPV, Landlord, PM company, or FM agency)
// ============================================================================
export const billing_entity = pgTable(
  "billing_entity",
  {
    // billing_entity.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // billing_entity.org_id — from §4.3, §4.4
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // billing_entity.client_account_id — from §4.3, §4.4 (nullable for portfolio-wide)
    client_account_id: uuid("client_account_id").references(
      (): any => client_account.id,
      { onDelete: "set null" }
    ),
    // billing_entity.entity_name — from §4.4
    entity_name: text("entity_name").notNull(),
    // billing_entity.entity_code — from §4.4
    entity_code: text("entity_code").notNull(),
    // billing_entity.entity_type — from §4.4
    entity_type: entityTypeEnum("entity_type").notNull(),
    // billing_entity.gst_number — from §4.4
    gst_number: text("gst_number"),
    // billing_entity.pan_number — from §4.4
    pan_number: text("pan_number"),
    // billing_entity.email — from §4.4
    email: text("email"),
    // billing_entity.phone — from §4.4
    phone: text("phone"),
    // billing_entity.address — from §4.4
    address: text("address"),
    // billing_entity.is_active — from §4.4
    is_active: boolean("is_active").default(true).notNull(),

    // Common Audit & System Fields (§4.3)
    // billing_entity.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // billing_entity.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // billing_entity.created_by — from §4.3
    created_by: uuid("created_by"),
    // billing_entity.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // billing_entity.version — from §4.3
    version: integer("version").default(1).notNull(),
    // billing_entity.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // billing_entity.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // billing_entity.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("billing_entity_org_entity_code_idx").on(
      table.org_id,
      table.entity_code
    ),
    index("billing_entity_org_id_idx").on(table.org_id),
    index("billing_entity_client_account_id_idx").on(table.client_account_id),
    index("billing_entity_entity_type_idx").on(table.entity_type),
    index("billing_entity_is_active_idx").on(table.is_active),
  ]
);

// ============================================================================
// 12. MANAGEMENT_MANDATE (§4.4 Operator Layer)
// Operator ↔ Property Owner agreement with fee structures and collection terms
// ============================================================================
export const management_mandate = pgTable(
  "management_mandate",
  {
    // management_mandate.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // management_mandate.org_id — from §4.3, §4.4
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // management_mandate.client_account_id — from §4.3, §4.4
    client_account_id: uuid("client_account_id")
      .notNull()
      .references(() => client_account.id, { onDelete: "cascade" }),
    // management_mandate.billing_entity_id — from §4.4
    billing_entity_id: uuid("billing_entity_id").references(
      () => billing_entity.id,
      { onDelete: "set null" }
    ),
    // management_mandate.mandate_start_date — from §4.4
    mandate_start_date: date("mandate_start_date"),
    // management_mandate.mandate_end_date — from §4.4
    mandate_end_date: date("mandate_end_date"),
    // management_mandate.principal_amount_inr — from §4.4
    principal_amount_inr: numeric("principal_amount_inr", {
      precision: 14,
      scale: 2,
    }),
    // management_mandate.fee_structure — from §4.4
    fee_structure: feeStructureEnum("fee_structure").notNull(),
    // management_mandate.fee_percent — from §4.4
    fee_percent: numeric("fee_percent", { precision: 5, scale: 2 }),
    // management_mandate.fee_fixed_inr — from §4.4
    fee_fixed_inr: numeric("fee_fixed_inr", { precision: 14, scale: 2 }),
    // management_mandate.fee_frequency — from §4.4
    fee_frequency: feeFrequencyEnum("fee_frequency").default("monthly"),
    // management_mandate.is_active — from §4.4
    is_active: boolean("is_active").default(true).notNull(),

    // Common Audit & System Fields (§4.3)
    // management_mandate.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // management_mandate.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // management_mandate.created_by — from §4.3
    created_by: uuid("created_by"),
    // management_mandate.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // management_mandate.version — from §4.3
    version: integer("version").default(1).notNull(),
    // management_mandate.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // management_mandate.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // management_mandate.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    index("management_mandate_org_id_idx").on(table.org_id),
    index("management_mandate_client_account_id_idx").on(
      table.client_account_id
    ),
    index("management_mandate_billing_entity_id_idx").on(
      table.billing_entity_id
    ),
    index("management_mandate_fee_structure_idx").on(table.fee_structure),
    index("management_mandate_is_active_idx").on(table.is_active),
  ]
);

// ============================================================================
// 13. DEAL (§4.7A Pipeline Register)
// Leasing pipeline held separately from executed contracts; converts on win
// ============================================================================
export const deal = pgTable(
  "deal",
  {
    // deal.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // deal.org_id — from §4.3, §4.7A
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // deal.client_account_id — from §4.3, §4.7A
    client_account_id: uuid("client_account_id")
      .notNull()
      .references(() => client_account.id, { onDelete: "cascade" }),
    // deal.space_id — from §4.7A
    space_id: uuid("space_id").references(() => space.id, {
      onDelete: "set null",
    }),
    // deal.occupant_id — from §4.7A
    occupant_id: uuid("occupant_id").references(() => occupant.id, {
      onDelete: "set null",
    }),
    // deal.deal_code — from §4.7A
    deal_code: text("deal_code").notNull(),
    // deal.deal_name — from §4.7A
    deal_name: text("deal_name").notNull(),
    // deal.deal_stage — from §4.7A
    deal_stage: dealStageEnum("deal_stage").default("lead").notNull(),
    // deal.probability_percent — from §4.7A
    probability_percent: integer("probability_percent").default(0).notNull(),
    // deal.contract_id — from §4.7A (set when deal converts to contract)
    contract_id: uuid("contract_id").references(() => contract.id, {
      onDelete: "set null",
    }),
    // deal.estimated_start_date — from §4.7A
    estimated_start_date: date("estimated_start_date"),
    // deal.estimated_end_date — from §4.7A
    estimated_end_date: date("estimated_end_date"),
    // deal.estimated_rent_inr — from §4.7A
    estimated_rent_inr: numeric("estimated_rent_inr", {
      precision: 14,
      scale: 2,
    }),
    // deal.estimated_area_sqft — from §4.7A
    estimated_area_sqft: numeric("estimated_area_sqft", {
      precision: 14,
      scale: 2,
    }),
    // deal.owner_comment — from §4.7A
    owner_comment: text("owner_comment"),
    // deal.leasing_manager_comment — from §4.7A
    leasing_manager_comment: text("leasing_manager_comment"),

    // Common Audit & System Fields (§4.3)
    // deal.created_at — from §4.3
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // deal.updated_at — from §4.3
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // deal.created_by — from §4.3
    created_by: uuid("created_by"),
    // deal.updated_by — from §4.3
    updated_by: uuid("updated_by"),
    // deal.version — from §4.3
    version: integer("version").default(1).notNull(),
    // deal.deleted_at — from §4.3
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    // deal.source_import_batch_id — from §4.3
    source_import_batch_id: uuid("source_import_batch_id"),
    // deal.source_row_id — from §4.3
    source_row_id: text("source_row_id"),
  },
  (table) => [
    uniqueIndex("deal_org_deal_code_idx").on(table.org_id, table.deal_code),
    index("deal_org_id_idx").on(table.org_id),
    index("deal_client_account_id_idx").on(table.client_account_id),
    index("deal_deal_stage_idx").on(table.deal_stage),
    index("deal_space_id_idx").on(table.space_id),
    index("deal_occupant_id_idx").on(table.occupant_id),
    index("deal_contract_id_idx").on(table.contract_id),
  ]
);

// ============================================================================
// 14. CONTRACT_CHARGE (§4.8 Revenue Lines / Charge Rules)
// Individual pricing components for contract (base rent, CAM, parking, utilities)
// ============================================================================
export const contract_charge = pgTable(
  "contract_charge",
  {
    // contract_charge.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // contract_charge.org_id — from §4.3, §4.8
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // contract_charge.client_account_id — from §4.3, §4.8
    client_account_id: uuid("client_account_id")
      .notNull()
      .references((): any => client_account.id, { onDelete: "cascade" }),
    // contract_charge.contract_id — from §4.8
    contract_id: uuid("contract_id")
      .notNull()
      .references(() => contract.id, { onDelete: "cascade" }),
    // contract_charge.component — from §4.8
    component: text("component").notNull(),
    // contract_charge.calc_basis — from §4.8
    calc_basis: chargeCalcBasisEnum("calc_basis").notNull(),
    // contract_charge.rate — from §4.8
    rate: numeric("rate", { precision: 14, scale: 4 }),
    // contract_charge.rate_period — from §4.8
    rate_period: text("rate_period").default("month"),
    // contract_charge.quantity_basis — from §4.8
    quantity_basis: numeric("quantity_basis", { precision: 14, scale: 2 }),
    // contract_charge.is_included — from §4.8
    is_included: boolean("is_included").default(false).notNull(),
    // contract_charge.is_recoverable — from §4.8
    is_recoverable: boolean("is_recoverable").default(false).notNull(),
    // contract_charge.invoice_group — from §4.8
    invoice_group: text("invoice_group").default("rent").notNull(),
    // contract_charge.billing_entity_id — from §4.8
    billing_entity_id: uuid("billing_entity_id").references(
      (): any => billing_entity.id,
      { onDelete: "set null" }
    ),
    // contract_charge.tax_profile_id — from §4.8
    tax_profile_id: uuid("tax_profile_id").references(
      (): any => tax_profile.id,
      { onDelete: "set null" }
    ),
    // contract_charge.hsn_sac — from §4.8
    hsn_sac: text("hsn_sac"),
    // contract_charge.source_document_id — from §4.8
    source_document_id: uuid("source_document_id"),
    // contract_charge.billing_mode — from §4.8
    billing_mode: billingModeEnum("billing_mode").default("advance").notNull(),
    // contract_charge.start_date — from §4.8
    start_date: date("start_date").notNull(),
    // contract_charge.end_date — from §4.8
    end_date: date("end_date").notNull(),
    // contract_charge.cam_pool_id — from §4.8
    cam_pool_id: uuid("cam_pool_id"),
    // contract_charge.meter_id — from §4.8
    meter_id: uuid("meter_id"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    source_import_batch_id: uuid("source_import_batch_id"),
    source_row_id: text("source_row_id"),
  },
  (table) => [
    index("contract_charge_org_id_idx").on(table.org_id),
    index("contract_charge_client_account_id_idx").on(table.client_account_id),
    index("contract_charge_contract_id_idx").on(table.contract_id),
    index("contract_charge_component_idx").on(table.component),
    index("contract_charge_invoice_group_idx").on(table.invoice_group),
  ]
);

// ============================================================================
// 15. RENT_STEP (§4.8 Escalations & Step-up Schedule)
// Future dated rates for escalation tracking, calendar view, and live calculation
// ============================================================================
export const rent_step = pgTable(
  "rent_step",
  {
    // rent_step.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // rent_step.org_id — from §4.3, §4.8
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // rent_step.client_account_id — from §4.3, §4.8
    client_account_id: uuid("client_account_id")
      .notNull()
      .references((): any => client_account.id, { onDelete: "cascade" }),
    // rent_step.contract_charge_id — from §4.8
    contract_charge_id: uuid("contract_charge_id")
      .notNull()
      .references(() => contract_charge.id, { onDelete: "cascade" }),
    // rent_step.step_no — from §4.8
    step_no: integer("step_no").notNull(),
    // rent_step.effective_date — from §4.8
    effective_date: date("effective_date").notNull(),
    // rent_step.escalation_type — from §4.8
    escalation_type: escalationTypeEnum("escalation_type").notNull(),
    // rent_step.escalation_value — from §4.8
    escalation_value: numeric("escalation_value", { precision: 14, scale: 2 }),
    // rent_step.cycle_months — from §4.8
    cycle_months: integer("cycle_months").default(12),
    // rent_step.compounding — from §4.8
    compounding: boolean("compounding").default(true),
    // rent_step.cpi_index — from §4.8
    cpi_index: text("cpi_index"),
    // rent_step.cap_pct — from §4.8
    cap_pct: numeric("cap_pct", { precision: 5, scale: 2 }),
    // rent_step.floor_pct — from §4.8
    floor_pct: numeric("floor_pct", { precision: 5, scale: 2 }),
    // rent_step.rate — from §4.8
    rate: numeric("rate", { precision: 14, scale: 4 }).notNull(),
    // rent_step.status — from §4.8
    status: rentStepStatusEnum("status").default("scheduled").notNull(),
    // rent_step.applied_at — from §4.8, §5.7
    applied_at: timestamp("applied_at", { withTimezone: true }),
    // rent_step.applied_by — from §4.8, §5.7
    applied_by: uuid("applied_by"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    source_import_batch_id: uuid("source_import_batch_id"),
    source_row_id: text("source_row_id"),
  },
  (table) => [
    index("rent_step_org_id_idx").on(table.org_id),
    index("rent_step_client_account_id_idx").on(table.client_account_id),
    index("rent_step_contract_charge_id_idx").on(table.contract_charge_id),
    index("rent_step_effective_date_idx").on(table.effective_date),
    index("rent_step_status_idx").on(table.status),
  ]
);

// ============================================================================
// 16. CONCESSION (§4.8 Concessions & Rent Free Periods)
// Rent-free periods, fitout contributions, and special commercial discounts
// ============================================================================
export const concession = pgTable(
  "concession",
  {
    // concession.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // concession.org_id — from §4.3, §4.8
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // concession.client_account_id — from §4.3, §4.8
    client_account_id: uuid("client_account_id")
      .notNull()
      .references((): any => client_account.id, { onDelete: "cascade" }),
    // concession.contract_id — from §4.8
    contract_id: uuid("contract_id")
      .notNull()
      .references(() => contract.id, { onDelete: "cascade" }),
    // concession.concession_type — from §4.8
    concession_type: concessionTypeEnum("concession_type").notNull(),
    // concession.start_date — from §4.8
    start_date: date("start_date").notNull(),
    // concession.end_date — from §4.8
    end_date: date("end_date").notNull(),
    // concession.concession_value — from §4.8
    concession_value: numeric("concession_value", {
      precision: 14,
      scale: 2,
    }).notNull(),
    // concession.description — from §4.8
    description: text("description"),
    // concession.clawback_clause — from §4.8
    clawback_clause: text("clawback_clause"),
    // concession.amortise — from §4.8 (Ind AS 116 effective rent)
    amortise: boolean("amortise").default(false).notNull(),
    // concession.approved_by — from §4.8
    approved_by: uuid("approved_by"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    source_import_batch_id: uuid("source_import_batch_id"),
    source_row_id: text("source_row_id"),
  },
  (table) => [
    index("concession_org_id_idx").on(table.org_id),
    index("concession_client_account_id_idx").on(table.client_account_id),
    index("concession_contract_id_idx").on(table.contract_id),
    index("concession_dates_idx").on(table.start_date, table.end_date),
  ]
);

// ============================================================================
// 17. CONTRACT_CLAUSE (§4.8 Commercial & Statutory Terms)
// Lock-in terms, break options, ROFR, ROFO, expansion & reinstatement rights
// ============================================================================
export const contract_clause = pgTable(
  "contract_clause",
  {
    // contract_clause.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // contract_clause.org_id — from §4.3, §4.8
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // contract_clause.client_account_id — from §4.3, §4.8
    client_account_id: uuid("client_account_id")
      .notNull()
      .references((): any => client_account.id, { onDelete: "cascade" }),
    // contract_clause.contract_id — from §4.8
    contract_id: uuid("contract_id")
      .notNull()
      .references(() => contract.id, { onDelete: "cascade" }),
    // contract_clause.clause_type — from §4.8
    clause_type: clauseTypeEnum("clause_type").notNull(),
    // contract_clause.clause_title — from §4.8
    clause_title: text("clause_title").notNull(),
    // contract_clause.clause_text — from §4.8
    clause_text: text("clause_text").notNull(),
    // contract_clause.window_start — from §4.8
    window_start: date("window_start"),
    // contract_clause.window_end — from §4.8
    window_end: date("window_end"),
    // contract_clause.terms — from §4.8
    terms: jsonb("terms"),
    // contract_clause.status — from §4.8
    status: clauseStatusEnum("status").default("open").notNull(),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    source_import_batch_id: uuid("source_import_batch_id"),
    source_row_id: text("source_row_id"),
  },
  (table) => [
    index("contract_clause_org_id_idx").on(table.org_id),
    index("contract_clause_client_account_id_idx").on(table.client_account_id),
    index("contract_clause_contract_id_idx").on(table.contract_id),
    index("contract_clause_clause_type_idx").on(table.clause_type),
    index("contract_clause_status_idx").on(table.status),
  ]
);

// ============================================================================
// 18. CONTRACT_DOCUMENT (§4.9 Contract Documents Repository)
// Dedicated document store per contract with versioning, watermarking & audit
// ============================================================================
export const contract_document = pgTable(
  "contract_document",
  {
    // contract_document.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // contract_document.org_id — from §4.3, §4.9
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // contract_document.client_account_id — from §4.3, §4.9
    client_account_id: uuid("client_account_id")
      .notNull()
      .references((): any => client_account.id, { onDelete: "cascade" }),
    // contract_document.contract_id — from §4.9
    contract_id: uuid("contract_id")
      .notNull()
      .references(() => contract.id, { onDelete: "cascade" }),
    // contract_document.doc_type — from §4.9
    doc_type: docTypeEnum("doc_type").notNull(),
    // contract_document.file_name — from §4.9
    file_name: text("file_name").notNull(),
    // contract_document.version — from §4.9 (version counter)
    version: integer("version").default(1).notNull(),
    // contract_document.is_current — from §4.9
    is_current: boolean("is_current").default(true).notNull(),
    // contract_document.status — from §4.9
    status: docStatusEnum("status").default("executed").notNull(),
    // contract_document.effective_date — from §4.9
    effective_date: date("effective_date"),
    // contract_document.expiry_date — from §4.9
    expiry_date: date("expiry_date"),
    // contract_document.visibility — from §4.9
    visibility: docVisibilityEnum("visibility")
      .default("client_visible")
      .notNull(),
    // contract_document.storage_path — from §4.9
    storage_path: text("storage_path").notNull(),
    // contract_document.checksum — from §4.9
    checksum: text("checksum"),
    // contract_document.file_size_bytes — from §4.9
    file_size_bytes: integer("file_size_bytes"),
    // contract_document.mime_type — from §4.9
    mime_type: text("mime_type"),
    // contract_document.watermark_text — from §4.9, §S-23
    watermark_text: text("watermark_text"),
    // contract_document.download_count — from §4.9
    download_count: integer("download_count").default(0).notNull(),
    // contract_document.view_count — from §4.9
    view_count: integer("view_count").default(0).notNull(),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    source_import_batch_id: uuid("source_import_batch_id"),
    source_row_id: text("source_row_id"),
  },
  (table) => [
    index("contract_document_org_id_idx").on(table.org_id),
    index("contract_document_client_account_id_idx").on(
      table.client_account_id
    ),
    index("contract_document_contract_id_idx").on(table.contract_id),
    index("contract_document_doc_type_idx").on(table.doc_type),
    index("contract_document_is_current_idx").on(table.is_current),
    index("contract_document_status_idx").on(table.status),
  ]
);

// ============================================================================
// 19. TASK (§4.10, §5.14 Unified Workflow Task Engine)
// Dedicated task entity powering Contract Approval Workflow, Expiry & Escalations
// ============================================================================
export const task = pgTable(
  "task",
  {
    // task.id — from §4.3
    id: uuid("id").primaryKey().defaultRandom(),
    // task.org_id — from §4.3, §4.10
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // task.client_account_id — from §4.3, §4.10
    client_account_id: uuid("client_account_id").references(
      (): any => client_account.id,
      { onDelete: "cascade" }
    ),
    // task.contract_id — from §4.10, §5.14
    contract_id: uuid("contract_id").references(() => contract.id, {
      onDelete: "cascade",
    }),
    // task.task_type — from §4.10
    task_type: taskTypeEnum("task_type").notNull(),
    // task.title — from §4.10
    title: text("title").notNull(),
    // task.description — from §4.10
    description: text("description"),
    // task.assigned_to — from §4.10, §5.14
    assigned_to: uuid("assigned_to"),
    // task.assigned_role — from §4.10, §5.14
    assigned_role: text("assigned_role").default("approver"),
    // task.status — from §4.10
    status: taskStatusEnum("status").default("pending").notNull(),
    // task.priority — from §4.10
    priority: taskPriorityEnum("priority").default("medium").notNull(),
    // task.due_date — from §4.10
    due_date: date("due_date"),
    // task.resolution_comment — from §4.10, §S-06
    resolution_comment: text("resolution_comment"),
    // task.completed_at — from §4.10
    completed_at: timestamp("completed_at", { withTimezone: true }),
    // task.completed_by — from §4.10
    completed_by: uuid("completed_by"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    source_import_batch_id: uuid("source_import_batch_id"),
    source_row_id: text("source_row_id"),
  },
  (table) => [
    index("task_org_id_idx").on(table.org_id),
    index("task_client_account_id_idx").on(table.client_account_id),
    index("task_contract_id_idx").on(table.contract_id),
    index("task_task_type_idx").on(table.task_type),
    index("task_status_idx").on(table.status),
  ]
);

// ----------------------------------------------------------------------------
// TYPESCRIPT TYPES (Inferred Select & Insert Types for all 19 Tables)
// ----------------------------------------------------------------------------
export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;

export type ClientAccount = typeof client_account.$inferSelect;
export type NewClientAccount = typeof client_account.$inferInsert;

export type Property = typeof property.$inferSelect;
export type NewProperty = typeof property.$inferInsert;

export type Building = typeof building.$inferSelect;
export type NewBuilding = typeof building.$inferInsert;

export type Space = typeof space.$inferSelect;
export type NewSpace = typeof space.$inferInsert;

export type Occupant = typeof occupant.$inferSelect;
export type NewOccupant = typeof occupant.$inferInsert;

export type Contract = typeof contract.$inferSelect;
export type NewContract = typeof contract.$inferInsert;

export type ContractSpace = typeof contract_space.$inferSelect;
export type NewContractSpace = typeof contract_space.$inferInsert;

export type ChargeType = typeof charge_type.$inferSelect;
export type NewChargeType = typeof charge_type.$inferInsert;

export type TaxProfile = typeof tax_profile.$inferSelect;
export type NewTaxProfile = typeof tax_profile.$inferInsert;

export type BillingEntity = typeof billing_entity.$inferSelect;
export type NewBillingEntity = typeof billing_entity.$inferInsert;

export type ManagementMandate = typeof management_mandate.$inferSelect;
export type NewManagementMandate = typeof management_mandate.$inferInsert;

export type Deal = typeof deal.$inferSelect;
export type NewDeal = typeof deal.$inferInsert;

export type ContractCharge = typeof contract_charge.$inferSelect;
export type NewContractCharge = typeof contract_charge.$inferInsert;

export type RentStep = typeof rent_step.$inferSelect;
export type NewRentStep = typeof rent_step.$inferInsert;

export type Concession = typeof concession.$inferSelect;
export type NewConcession = typeof concession.$inferInsert;

export type ContractClause = typeof contract_clause.$inferSelect;
export type NewContractClause = typeof contract_clause.$inferInsert;

export type ContractDocument = typeof contract_document.$inferSelect;
export type NewContractDocument = typeof contract_document.$inferInsert;

export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;

// ============================================================================
// ROW LEVEL SECURITY (RLS) POLICY FRAMEWORK
// Architectural definition for Multi-Tenancy and Managed Portfolio Isolation
// ============================================================================
export const rlsPolicyFramework = {
  anchorColumns: ["org_id", "client_account_id", "deleted_at"],
  tenantOrgSetting: "app.current_org_id",
  clientAccountSetting: "app.current_client_account_id",
  securedTables: [
    "organization",
    "client_account",
    "property",
    "building",
    "space",
    "occupant",
    "contract",
    "contract_space",
    "charge_type",
    "tax_profile",
    "billing_entity",
    "management_mandate",
    "deal",
    "contract_charge",
    "rent_step",
    "concession",
    "contract_clause",
    "contract_document",
    "task",
    "mapping_template",
    "import_batch",
    "import_row_staging",
    "import_exception",
  ] as const,
};

// ============================================================================
// P1 DATA IMPORT ENGINE ENUMS & SCHEMAS (§4.15, §5.5)
// ============================================================================

export const importStatusEnum = pgEnum("import_status", [
  "uploading",
  "parsing",
  "mapping",
  "validating",
  "diffing",
  "approved",
  "committed",
  "voided",
]);

export const validationStatusEnum = pgEnum("validation_status", [
  "passed",
  "warning",
  "failed",
  "unmapped",
]);

export const flagTypeEnum = pgEnum("flag_type", [
  "info",
  "warning",
  "error",
]);

// 1. MAPPING_TEMPLATE (§4.15, RR-IMP-02)
export const mapping_template = pgTable(
  "mapping_template",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id")
      .references((): any => client_account.id, { onDelete: "cascade" }),
    template_name: text("template_name").notNull(),
    template_version: integer("template_version").default(1).notNull(),
    mapping_rules: jsonb("mapping_rules").default({}).notNull(),
    synonym_dict: jsonb("synonym_dict").default({}).notNull(),
    transform_rules: jsonb("transform_rules").default({}).notNull(),
    is_active: boolean("is_active").default(true).notNull(),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("mapping_template_org_name_ver_idx").on(
      table.org_id,
      table.template_name,
      table.template_version
    ),
    index("mapping_template_org_id_idx").on(table.org_id),
  ]
);

// 2. IMPORT_BATCH (§4.15, §5.5, RR-IMP-01/10)
export const import_batch = pgTable(
  "import_batch",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id")
      .references((): any => client_account.id, { onDelete: "cascade" }),
    batch_code: text("batch_code").notNull(),
    file_name: text("file_name").notNull(),
    file_size_bytes: integer("file_size_bytes").default(0).notNull(),
    mapping_template_id: uuid("mapping_template_id")
      .references(() => mapping_template.id, { onDelete: "set null" }),
    total_rows: integer("total_rows").default(0).notNull(),
    passed_rows: integer("passed_rows").default(0).notNull(),
    warning_rows: integer("warning_rows").default(0).notNull(),
    failed_rows: integer("failed_rows").default(0).notNull(),
    unmapped_rows: integer("unmapped_rows").default(0).notNull(),
    import_status: importStatusEnum("import_status").default("uploading").notNull(),
    imported_at: timestamp("imported_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    imported_by: uuid("imported_by"),
    committed_at: timestamp("committed_at", { withTimezone: true }),
    voided_at: timestamp("voided_at", { withTimezone: true }),
    voided_by: uuid("voided_by"),
    error_file_path: text("error_file_path"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("import_batch_org_code_idx").on(table.org_id, table.batch_code),
    index("import_batch_org_id_idx").on(table.org_id),
    index("import_batch_client_account_id_idx").on(table.client_account_id),
    index("import_batch_status_idx").on(table.import_status),
  ]
);

// 3. IMPORT_ROW_STAGING (§4.15, RR-IMP-04/08)
export const import_row_staging = pgTable(
  "import_row_staging",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id")
      .references((): any => client_account.id, { onDelete: "cascade" }),
    import_batch_id: uuid("import_batch_id")
      .notNull()
      .references(() => import_batch.id, { onDelete: "cascade" }),
    source_row_num: integer("source_row_num").notNull(),
    source_row_json: jsonb("source_row_json").notNull(),
    parsed_row_json: jsonb("parsed_row_json"),
    validation_status: validationStatusEnum("validation_status")
      .default("unmapped")
      .notNull(),
    validation_errors: jsonb("validation_errors").default([]).notNull(),
    mapped_to_entity: jsonb("mapped_to_entity"),
    unmapped_columns: jsonb("unmapped_columns").default({}).notNull(),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("import_row_staging_batch_id_idx").on(table.import_batch_id),
    index("import_row_staging_validation_status_idx").on(table.validation_status),
    index("import_row_staging_org_id_idx").on(table.org_id),
  ]
);

// 4. IMPORT_EXCEPTION (§4.15, §5.5, RR-IMP-06)
export const import_exception = pgTable(
  "import_exception",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id")
      .references((): any => client_account.id, { onDelete: "cascade" }),
    import_batch_id: uuid("import_batch_id")
      .notNull()
      .references(() => import_batch.id, { onDelete: "cascade" }),
    source_row_num: integer("source_row_num").notNull(),
    field_name: text("field_name").notNull(),
    flag_type: flagTypeEnum("flag_type").notNull(),
    flag_message: text("flag_message").notNull(),
    expected_value: text("expected_value"),
    actual_value: text("actual_value"),
    user_resolved_at: timestamp("user_resolved_at", { withTimezone: true }),
    user_resolution: text("user_resolution"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("import_exception_batch_id_idx").on(table.import_batch_id),
    index("import_exception_flag_type_idx").on(table.flag_type),
    index("import_exception_org_id_idx").on(table.org_id),
  ]
);

// Type inferences
export type MappingTemplate = typeof mapping_template.$inferSelect;
export type NewMappingTemplate = typeof mapping_template.$inferInsert;

export type ImportBatch = typeof import_batch.$inferSelect;
export type NewImportBatch = typeof import_batch.$inferInsert;

export type ImportRowStaging = typeof import_row_staging.$inferSelect;
export type NewImportRowStaging = typeof import_row_staging.$inferInsert;

export type ImportException = typeof import_exception.$inferSelect;
export type NewImportException = typeof import_exception.$inferInsert;

// Aliases for camelCase imports
export const mappingTemplate = mapping_template;
export const importBatch = import_batch;
export const importRowStaging = import_row_staging;
export const importException = import_exception;
export const contractCharge = contract_charge;
export const rentStep = rent_step;
export const contractClause = contract_clause;
export const contractDocument = contract_document;
export const contractSpace = contract_space;
export const clientAccount = client_account;
export const managementMandate = management_mandate;
export const billingEntity = billing_entity;
export const chargeType = charge_type;
export const taxProfile = tax_profile;

// ============================================================================
// PHASE 3: PAYMENTS, COLLECTIONS, AND DISPUTES (§4.10, §5.9, §5.13)
// ============================================================================

export const paymentChannelEnum = pgEnum("payment_channel", [
  "bank_transfer",
  "cheque",
  "upi",
  "cash",
  "credit",
  "other",
]);

export const paymentStatusP3Enum = pgEnum("payment_status_p3", [
  "received",
  "reconciled",
  "reversed",
]);

export const disputeTypeEnum = pgEnum("dispute_type_p3", [
  "incorrect_amount",
  "duplicate_charge",
  "already_paid",
  "quality_issue",
  "other",
]);

export const disputeStatusEnum = pgEnum("dispute_status_p3", [
  "open",
  "under_investigation",
  "resolved",
  "rejected",
]);

// 1. INVOICE TABLE MAPPING (§4.10, §5.9)
export const invoice = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id").references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id").references((): any => client_account.id, { onDelete: "cascade" }),
    contract_id: uuid("contract_id").references(() => contract.id, { onDelete: "set null" }),
    lease_id: uuid("lease_id"),
    property_id: uuid("property_id"),
    occupant_id: uuid("occupant_id").references(() => occupant.id, { onDelete: "set null" }),
    tenant_id: uuid("tenant_id"),
    invoice_number: text("invoice_number").notNull(),
    fy_year: text("fy_year"),
    invoice_date: date("invoice_date").notNull(),
    due_date: date("due_date").notNull(),
    period_start: date("period_start"),
    period_end: date("period_end"),
    base_rent: numeric("base_rent", { precision: 14, scale: 2 }).default("0.00"),
    cam_charges: numeric("cam_charges", { precision: 14, scale: 2 }).default("0.00"),
    utility_charges: numeric("utility_charges", { precision: 14, scale: 2 }).default("0.00"),
    other_charges: numeric("other_charges", { precision: 14, scale: 2 }).default("0.00"),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0.00"),
    gst_rate: numeric("gst_rate", { precision: 5, scale: 2 }).default("18.00"),
    gst_amount: numeric("gst_amount", { precision: 14, scale: 2 }).default("0.00"),
    gross_total: numeric("gross_total", { precision: 14, scale: 2 }).notNull(),
    tds_deducted: numeric("tds_deducted", { precision: 14, scale: 2 }).default("0.00"),
    net_payable: numeric("net_payable", { precision: 14, scale: 2 }).default("0.00"),
    amount_paid: numeric("amount_paid", { precision: 14, scale: 2 }).default("0.00"),
    balance_due: numeric("balance_due", { precision: 14, scale: 2 }).notNull(),
    status: text("status").default("issued").notNull(),
    pdf_url: text("pdf_url"),
    sent_at: timestamp("sent_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("invoices_invoice_number_idx").on(table.invoice_number),
    index("invoices_org_id_idx").on(table.org_id),
    index("invoices_contract_id_idx").on(table.contract_id),
    index("invoices_occupant_id_idx").on(table.occupant_id),
    index("invoices_status_idx").on(table.status),
    index("invoices_due_date_idx").on(table.due_date),
  ]
);

// 1b. INVOICE LINE (§4.10, §0.2, §4.3)
export const invoice_line = pgTable(
  "invoice_line",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id").references(
      (): any => client_account.id,
      { onDelete: "cascade" }
    ),
    invoice_id: uuid("invoice_id")
      .notNull()
      .references((): any => invoice.id, { onDelete: "cascade" }),
    contract_charge_id: uuid("contract_charge_id").references(
      (): any => contract_charge.id,
      { onDelete: "set null" }
    ),
    charge_type_id: uuid("charge_type_id").references(
      (): any => charge_type.id,
      { onDelete: "set null" }
    ),
    description: text("description"),
    quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1.00"),
    rate: numeric("rate", { precision: 14, scale: 2 }).default("0.00").notNull(),
    amount_inr: numeric("amount_inr", { precision: 14, scale: 2 }).default("0.00").notNull(),
    tax_rate_percent: numeric("tax_rate_percent", { precision: 5, scale: 2 }).default("18.00"),
    tax_amount_inr: numeric("tax_amount_inr", { precision: 14, scale: 2 }).default("0.00"),
    escalation_amount_inr: numeric("escalation_amount_inr", { precision: 14, scale: 2 }).default("0.00"),
    concession_amount_inr: numeric("concession_amount_inr", { precision: 14, scale: 2 }).default("0.00"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("invoice_line_org_id_idx").on(table.org_id),
    index("invoice_line_client_account_id_idx").on(table.client_account_id),
    index("invoice_line_invoice_id_idx").on(table.invoice_id),
    index("invoice_line_contract_charge_id_idx").on(table.contract_charge_id),
    index("invoice_line_charge_type_id_idx").on(table.charge_type_id),
  ]
);

// 2. PAYMENT (§5.9, RR-PAY-01)
export const payment = pgTable(
  "payment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id")
      .references((): any => client_account.id, { onDelete: "cascade" }),
    occupant_id: uuid("occupant_id")
      .notNull()
      .references(() => occupant.id, { onDelete: "restrict" }),
    contract_id: uuid("contract_id")
      .references(() => contract.id, { onDelete: "set null" }),
    payment_code: text("payment_code").notNull(),
    payment_date: date("payment_date").notNull(),
    amount_inr: numeric("amount_inr", { precision: 14, scale: 2 }).notNull(),
    payment_mode: paymentChannelEnum("payment_mode").default("bank_transfer").notNull(),
    payment_ref: text("payment_ref").notNull(),
    bank_account_id: uuid("bank_account_id"),
    cheque_number: text("cheque_number"),
    cheque_date: date("cheque_date"),
    cheque_bank_name: text("cheque_bank_name"),
    payment_status: paymentStatusP3Enum("payment_status").default("received").notNull(),
    is_matched: boolean("is_matched").default(false).notNull(),
    notes: text("notes"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("payment_org_code_idx").on(table.org_id, table.payment_code),
    index("payment_org_id_idx").on(table.org_id),
    index("payment_client_account_id_idx").on(table.client_account_id),
    index("payment_occupant_id_idx").on(table.occupant_id),
    index("payment_contract_id_idx").on(table.contract_id),
    index("payment_status_idx").on(table.payment_status),
    index("payment_ref_idx").on(table.payment_ref),
  ]
);

// 3. PAYMENT_ALLOCATION (§4.10, §5.9, RR-PAY-02)
export const payment_allocation = pgTable(
  "payment_allocation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id")
      .references((): any => client_account.id, { onDelete: "cascade" }),
    payment_id: uuid("payment_id")
      .notNull()
      .references(() => payment.id, { onDelete: "cascade" }),
    invoice_id: uuid("invoice_id")
      .notNull()
      .references((): any => invoice.id, { onDelete: "cascade" }),
    invoice_line_id: uuid("invoice_line_id").references((): any => invoice_line.id, { onDelete: "set null" }),
    amount_allocated_inr: numeric("amount_allocated_inr", { precision: 14, scale: 2 }).notNull(),
    allocation_date: date("allocation_date").notNull(),
    allocated_by: uuid("allocated_by"),
    notes: text("notes"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("payment_allocation_org_id_idx").on(table.org_id),
    index("payment_allocation_payment_id_idx").on(table.payment_id),
    index("payment_allocation_invoice_id_idx").on(table.invoice_id),
  ]
);

// 4. DISPUTE (§5.9, RR-PAY-04)
export const dispute = pgTable(
  "dispute",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    client_account_id: uuid("client_account_id")
      .references((): any => client_account.id, { onDelete: "cascade" }),
    invoice_id: uuid("invoice_id")
      .notNull()
      .references((): any => invoice.id, { onDelete: "cascade" }),
    contract_id: uuid("contract_id")
      .references(() => contract.id, { onDelete: "set null" }),
    occupant_id: uuid("occupant_id")
      .references(() => occupant.id, { onDelete: "set null" }),
    dispute_code: text("dispute_code").notNull(),
    dispute_type: disputeTypeEnum("dispute_type").notNull(),
    dispute_reason: text("dispute_reason").notNull(),
    occupant_response: text("occupant_response"),
    dispute_status: disputeStatusEnum("dispute_status").default("open").notNull(),
    resolution: text("resolution"),
    resolved_at: timestamp("resolved_at", { withTimezone: true }),
    resolved_by: uuid("resolved_by"),

    // Common Audit & System Fields (§4.3)
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    created_by: uuid("created_by"),
    updated_by: uuid("updated_by"),
    version: integer("version").default(1).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("dispute_org_code_idx").on(table.org_id, table.dispute_code),
    index("dispute_org_id_idx").on(table.org_id),
    index("dispute_invoice_id_idx").on(table.invoice_id),
    index("dispute_status_idx").on(table.dispute_status),
  ]
);

// Type inferences
export type Invoice = typeof invoice.$inferSelect;
export type NewInvoice = typeof invoice.$inferInsert;

export type InvoiceLine = typeof invoice_line.$inferSelect;
export type NewInvoiceLine = typeof invoice_line.$inferInsert;

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;

export type PaymentAllocation = typeof payment_allocation.$inferSelect;
export type NewPaymentAllocation = typeof payment_allocation.$inferInsert;

export type Dispute = typeof dispute.$inferSelect;
export type NewDispute = typeof dispute.$inferInsert;

// Aliases
export const invoices = invoice;
export const invoiceLine = invoice_line;
export const paymentAllocation = payment_allocation;


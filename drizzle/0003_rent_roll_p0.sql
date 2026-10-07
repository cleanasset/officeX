CREATE TYPE "public"."approval_status" AS ENUM('draft', 'submitted', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."area_unit" AS ENUM('sqft', 'sqm');--> statement-breakpoint
CREATE TYPE "public"."billing_model" AS ENUM('area', 'seats', 'fixed', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."charge_category" AS ENUM('base_rent', 'recovery', 'service_charge', 'utility', 'deposit', 'deposit_return', 'credit_note', 'concession');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('draft', 'future', 'active', 'notice_served', 'holding_over', 'expired', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('lease', 'leave_and_licence', 'managed_office_agreement', 'co_working_membership', 'service_charge_agreement', 'head_lease');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('lead', 'site_visit', 'proposal', 'loi', 'agreement_drafting', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."deposit_status" AS ENUM('pending', 'received', 'adjusted', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."direction" AS ENUM('receivable', 'payable');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('owner', 'property_manager', 'fm_company', 'operator');--> statement-breakpoint
CREATE TYPE "public"."fee_frequency" AS ENUM('monthly', 'quarterly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."fee_structure" AS ENUM('percentage', 'fixed', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."occupancy_status" AS ENUM('vacant', 'occupied', 'under_maintenance', 'retired');--> statement-breakpoint
CREATE TYPE "public"."occupant_status" AS ENUM('active', 'notice_served', 'holding_over', 'vacant', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."occupant_type" AS ENUM('individual', 'company', 'partnership', 'trust');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('office', 'residential', 'retail', 'flex_workspace', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."space_type" AS ENUM('entire_building', 'floor', 'wing', 'suite', 'cabin', 'desk', 'parking');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'suspended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."tax_type" AS ENUM('gst', 'vat', 'other');--> statement-breakpoint
CREATE TABLE "contract_clauses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"clause_type" varchar(50) NOT NULL,
	"clause_title" varchar(150) NOT NULL,
	"clause_text" text NOT NULL,
	"is_standard" boolean DEFAULT true NOT NULL,
	"financial_impact" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_concessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"concession_type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '100.00' NOT NULL,
	"description" varchar(255),
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_spaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"allocated_area" numeric(12, 2) NOT NULL,
	"allocated_rent_amount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"is_primary_space" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deposit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"instrument_type" varchar(50) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"bank_name" varchar(150),
	"instrument_reference" varchar(100),
	"validity_date" date,
	"required_deposit_amount" numeric(14, 2),
	"shortfall_amount" numeric(14, 2) DEFAULT '0.00',
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing_entity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid,
	"entity_name" text NOT NULL,
	"entity_code" text NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"gst_number" text,
	"pan_number" text,
	"email" text,
	"phone" text,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "building" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"building_name" text NOT NULL,
	"building_code" text NOT NULL,
	"address" text,
	"floors" integer,
	"total_area_sqft" numeric(14, 2),
	"total_seats" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "charge_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid,
	"charge_code" text NOT NULL,
	"charge_name" text NOT NULL,
	"charge_category" charge_category NOT NULL,
	"is_taxable" boolean DEFAULT false NOT NULL,
	"is_recurring" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "client_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid,
	"client_name" text NOT NULL,
	"client_code" text NOT NULL,
	"is_self" boolean DEFAULT true NOT NULL,
	"owner_party_id" uuid,
	"billing_entity_id" uuid,
	"management_mandate" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "contract" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"occupant_id" uuid NOT NULL,
	"contract_code" text NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	"direction" "direction" DEFAULT 'receivable' NOT NULL,
	"billing_model" "billing_model" NOT NULL,
	"contract_status" "contract_status" DEFAULT 'draft' NOT NULL,
	"approval_status" "approval_status" DEFAULT 'draft' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"renewal_date" date,
	"notice_period_days" integer,
	"deposit_amount_inr" numeric(14, 2),
	"deposit_status" "deposit_status" DEFAULT 'pending',
	"lock_in_period_days" integer,
	"is_evergreen" boolean DEFAULT false NOT NULL,
	"commencement_date" date,
	"execution_date" date,
	"is_template" boolean DEFAULT false NOT NULL,
	"alternate_address" text,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "contract_space" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"area_allocated_sqft" numeric(14, 2),
	"seats_allocated" integer,
	"index_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "deal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"space_id" uuid,
	"occupant_id" uuid,
	"deal_code" text NOT NULL,
	"deal_name" text NOT NULL,
	"deal_stage" "deal_stage" DEFAULT 'lead' NOT NULL,
	"probability_percent" integer DEFAULT 0 NOT NULL,
	"contract_id" uuid,
	"estimated_start_date" date,
	"estimated_end_date" date,
	"estimated_rent_inr" numeric(14, 2),
	"estimated_area_sqft" numeric(14, 2),
	"owner_comment" text,
	"leasing_manager_comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "management_mandate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"billing_entity_id" uuid,
	"mandate_start_date" date,
	"mandate_end_date" date,
	"principal_amount_inr" numeric(14, 2),
	"fee_structure" "fee_structure" NOT NULL,
	"fee_percent" numeric(5, 2),
	"fee_fixed_inr" numeric(14, 2),
	"fee_frequency" "fee_frequency" DEFAULT 'monthly',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "occupant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid,
	"occupant_code" text NOT NULL,
	"occupant_name" text NOT NULL,
	"occupant_type" "occupant_type" DEFAULT 'company' NOT NULL,
	"email" text,
	"phone" text,
	"gst_number" text,
	"pan_number" text,
	"address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"industry_sector" text,
	"is_critical_occupant" boolean DEFAULT false NOT NULL,
	"occupant_status" "occupant_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"client_account_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'active' NOT NULL,
	"workspace_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"property_name" text NOT NULL,
	"property_code" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country_code" text DEFAULT 'IN',
	"total_leasable_area_sqft" numeric(14, 2) NOT NULL,
	"total_leasable_seats" integer,
	"timezone" text DEFAULT 'Asia/Kolkata',
	"property_type" "property_type",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "space" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"building_id" uuid NOT NULL,
	"space_code" text NOT NULL,
	"space_name" text NOT NULL,
	"floor_name" text,
	"space_type" "space_type",
	"chargeable_area_sqft" numeric(14, 2) NOT NULL,
	"carpet_area_sqft" numeric(14, 2),
	"super_area_sqft" numeric(14, 2),
	"area_unit" "area_unit" DEFAULT 'sqft',
	"is_leasable" boolean DEFAULT true NOT NULL,
	"occupancy_status" "occupancy_status" DEFAULT 'vacant' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "tax_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid,
	"tax_name" text NOT NULL,
	"tax_type" "tax_type" DEFAULT 'gst' NOT NULL,
	"tax_rate_percent" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "workspace_name" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "org_id" uuid;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "client_account_id" uuid;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "version" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "source_import_batch_id" uuid;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "source_row_id" text;--> statement-breakpoint
ALTER TABLE "contract_clauses" ADD CONSTRAINT "contract_clauses_contract_id_leases_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_concessions" ADD CONSTRAINT "contract_concessions_contract_id_leases_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_concessions" ADD CONSTRAINT "contract_concessions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_spaces" ADD CONSTRAINT "contract_spaces_contract_id_leases_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_spaces" ADD CONSTRAINT "contract_spaces_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_transactions" ADD CONSTRAINT "deposit_transactions_contract_id_leases_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_entity" ADD CONSTRAINT "billing_entity_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_entity" ADD CONSTRAINT "billing_entity_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building" ADD CONSTRAINT "building_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building" ADD CONSTRAINT "building_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building" ADD CONSTRAINT "building_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_type" ADD CONSTRAINT "charge_type_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_type" ADD CONSTRAINT "charge_type_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_account" ADD CONSTRAINT "client_account_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_account" ADD CONSTRAINT "client_account_owner_party_id_occupant_id_fk" FOREIGN KEY ("owner_party_id") REFERENCES "public"."occupant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_account" ADD CONSTRAINT "client_account_billing_entity_id_billing_entity_id_fk" FOREIGN KEY ("billing_entity_id") REFERENCES "public"."billing_entity"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_occupant_id_occupant_id_fk" FOREIGN KEY ("occupant_id") REFERENCES "public"."occupant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_space" ADD CONSTRAINT "contract_space_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_space" ADD CONSTRAINT "contract_space_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_space" ADD CONSTRAINT "contract_space_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_space" ADD CONSTRAINT "contract_space_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_occupant_id_occupant_id_fk" FOREIGN KEY ("occupant_id") REFERENCES "public"."occupant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_mandate" ADD CONSTRAINT "management_mandate_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_mandate" ADD CONSTRAINT "management_mandate_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_mandate" ADD CONSTRAINT "management_mandate_billing_entity_id_billing_entity_id_fk" FOREIGN KEY ("billing_entity_id") REFERENCES "public"."billing_entity"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occupant" ADD CONSTRAINT "occupant_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occupant" ADD CONSTRAINT "occupant_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space" ADD CONSTRAINT "space_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space" ADD CONSTRAINT "space_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space" ADD CONSTRAINT "space_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_profile" ADD CONSTRAINT "tax_profile_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_profile" ADD CONSTRAINT "tax_profile_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_entity_org_entity_code_idx" ON "billing_entity" USING btree ("org_id","entity_code");--> statement-breakpoint
CREATE INDEX "billing_entity_org_id_idx" ON "billing_entity" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "billing_entity_client_account_id_idx" ON "billing_entity" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "billing_entity_entity_type_idx" ON "billing_entity" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "billing_entity_is_active_idx" ON "billing_entity" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "building_property_building_code_idx" ON "building" USING btree ("property_id","building_code");--> statement-breakpoint
CREATE INDEX "building_org_id_idx" ON "building" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "building_client_account_id_idx" ON "building" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "building_property_id_idx" ON "building" USING btree ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "charge_type_org_charge_code_idx" ON "charge_type" USING btree ("org_id","charge_code");--> statement-breakpoint
CREATE INDEX "charge_type_org_id_idx" ON "charge_type" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "charge_type_client_account_id_idx" ON "charge_type" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "charge_type_charge_category_idx" ON "charge_type" USING btree ("charge_category");--> statement-breakpoint
CREATE INDEX "charge_type_is_active_idx" ON "charge_type" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "client_account_org_client_code_idx" ON "client_account" USING btree ("org_id","client_code");--> statement-breakpoint
CREATE INDEX "client_account_org_id_idx" ON "client_account" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "client_account_owner_party_id_idx" ON "client_account" USING btree ("owner_party_id");--> statement-breakpoint
CREATE INDEX "client_account_billing_entity_id_idx" ON "client_account" USING btree ("billing_entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "contract_org_contract_code_idx" ON "contract" USING btree ("org_id","contract_code");--> statement-breakpoint
CREATE INDEX "contract_org_id_idx" ON "contract" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contract_client_account_id_idx" ON "contract" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "contract_space_id_idx" ON "contract" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "contract_occupant_id_idx" ON "contract" USING btree ("occupant_id");--> statement-breakpoint
CREATE INDEX "contract_contract_status_idx" ON "contract" USING btree ("contract_status");--> statement-breakpoint
CREATE INDEX "contract_approval_status_idx" ON "contract" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "contract_contract_type_idx" ON "contract" USING btree ("contract_type");--> statement-breakpoint
CREATE INDEX "contract_dates_idx" ON "contract" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "contract_space_unique_idx" ON "contract_space" USING btree ("contract_id","space_id");--> statement-breakpoint
CREATE INDEX "contract_space_org_id_idx" ON "contract_space" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contract_space_client_account_id_idx" ON "contract_space" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "contract_space_contract_id_idx" ON "contract_space" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "contract_space_space_id_idx" ON "contract_space" USING btree ("space_id");--> statement-breakpoint
CREATE UNIQUE INDEX "deal_org_deal_code_idx" ON "deal" USING btree ("org_id","deal_code");--> statement-breakpoint
CREATE INDEX "deal_org_id_idx" ON "deal" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "deal_client_account_id_idx" ON "deal" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "deal_deal_stage_idx" ON "deal" USING btree ("deal_stage");--> statement-breakpoint
CREATE INDEX "deal_space_id_idx" ON "deal" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "deal_occupant_id_idx" ON "deal" USING btree ("occupant_id");--> statement-breakpoint
CREATE INDEX "deal_contract_id_idx" ON "deal" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "management_mandate_org_id_idx" ON "management_mandate" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "management_mandate_client_account_id_idx" ON "management_mandate" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "management_mandate_billing_entity_id_idx" ON "management_mandate" USING btree ("billing_entity_id");--> statement-breakpoint
CREATE INDEX "management_mandate_fee_structure_idx" ON "management_mandate" USING btree ("fee_structure");--> statement-breakpoint
CREATE INDEX "management_mandate_is_active_idx" ON "management_mandate" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "occupant_org_occupant_code_idx" ON "occupant" USING btree ("org_id","occupant_code");--> statement-breakpoint
CREATE INDEX "occupant_org_id_idx" ON "occupant" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "occupant_client_account_id_idx" ON "occupant" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "occupant_occupant_status_idx" ON "occupant" USING btree ("occupant_status");--> statement-breakpoint
CREATE INDEX "occupant_occupant_type_idx" ON "occupant" USING btree ("occupant_type");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_idx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organization_subscription_status_idx" ON "organization" USING btree ("subscription_status");--> statement-breakpoint
CREATE UNIQUE INDEX "property_org_property_code_idx" ON "property" USING btree ("org_id","property_code");--> statement-breakpoint
CREATE INDEX "property_org_id_idx" ON "property" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "property_client_account_id_idx" ON "property" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "property_property_type_idx" ON "property" USING btree ("property_type");--> statement-breakpoint
CREATE UNIQUE INDEX "space_building_space_code_idx" ON "space" USING btree ("building_id","space_code");--> statement-breakpoint
CREATE INDEX "space_org_id_idx" ON "space" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "space_client_account_id_idx" ON "space" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "space_building_id_idx" ON "space" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "space_space_type_idx" ON "space" USING btree ("space_type");--> statement-breakpoint
CREATE INDEX "space_occupancy_status_idx" ON "space" USING btree ("occupancy_status");--> statement-breakpoint
CREATE INDEX "tax_profile_org_id_idx" ON "tax_profile" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "tax_profile_client_account_id_idx" ON "tax_profile" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "tax_profile_tax_type_idx" ON "tax_profile" USING btree ("tax_type");--> statement-breakpoint
CREATE INDEX "tax_profile_is_active_idx" ON "tax_profile" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_slug_unique" UNIQUE("slug");
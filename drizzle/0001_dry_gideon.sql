CREATE TYPE "public"."billing_frequency" AS ENUM('monthly', 'quarterly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."escalation_apply_status" AS ENUM('pending', 'applied', 'waived', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('cam', 'property_tax', 'insurance', 'utility_water', 'utility_power', 'repairs_maintenance', 'statutory_fees', 'mgmt_fee', 'other');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."lease_status" AS ENUM('draft', 'active', 'under_notice', 'expired', 'terminated', 'holdover');--> statement-breakpoint
CREATE TYPE "public"."notice_reason" AS ENUM('relocation', 'downsizing', 'cost', 'lease_expiry', 'dispute', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('neft_rtgs', 'upi', 'cheque', 'ach', 'credit_card');--> statement-breakpoint
CREATE TYPE "public"."renewal_status" AS ENUM('not_due', 'approaching', 'under_negotiation', 'renewed', 'vacating');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('active', 'inactive', 'prospect', 'blacklisted');--> statement-breakpoint
ALTER TYPE "public"."property_grade" ADD VALUE 'A+';--> statement-breakpoint
ALTER TYPE "public"."property_grade" ADD VALUE 'B+';--> statement-breakpoint
ALTER TYPE "public"."unit_status" ADD VALUE 'under_fitout';--> statement-breakpoint
ALTER TYPE "public"."unit_status" ADD VALUE 'maintenance';--> statement-breakpoint
CREATE TABLE "alert_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"alert_type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid,
	"severity" varchar(50) DEFAULT 'info' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"trigger_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL,
	"category" varchar(100) NOT NULL,
	"location_details" text,
	"manufacturer" varchar(100),
	"commissioning_date" date,
	"warranty_expiry" date,
	"assigned_vendor_id" uuid,
	"status" varchar(50) DEFAULT 'operational' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "assets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"building_name" varchar(255) NOT NULL,
	"building_code" varchar(50),
	"total_floors" integer DEFAULT 1 NOT NULL,
	"total_area" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"invoice_id" uuid,
	"lease_id" uuid NOT NULL,
	"tenant_id" uuid,
	"receipt_number" varchar(100) NOT NULL,
	"payment_date" date NOT NULL,
	"payment_mode" "payment_mode" DEFAULT 'neft_rtgs' NOT NULL,
	"reference_number" varchar(100),
	"amount_received" numeric(14, 2) NOT NULL,
	"tds_deducted" numeric(14, 2) DEFAULT '0.00',
	"bank_charges" numeric(10, 2) DEFAULT '0.00',
	"net_credited" numeric(14, 2) NOT NULL,
	"bank_account" varchar(100),
	"notes" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "collections_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lease_id" uuid NOT NULL,
	"escalation_date" date NOT NULL,
	"previous_rent" numeric(14, 2) NOT NULL,
	"new_rent" numeric(14, 2) NOT NULL,
	"escalation_pct" numeric(5, 2) NOT NULL,
	"calculated_increase" numeric(14, 2) NOT NULL,
	"status" "escalation_apply_status" DEFAULT 'pending' NOT NULL,
	"applied_at" timestamp with time zone,
	"applied_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"property_id" uuid NOT NULL,
	"expense_category" "expense_category" DEFAULT 'cam' NOT NULL,
	"vendor_name" varchar(255) NOT NULL,
	"invoice_number" varchar(100),
	"expense_date" date NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"gst_amount" numeric(14, 2) DEFAULT '0.00',
	"total_amount" numeric(14, 2) NOT NULL,
	"paid_date" date,
	"payment_status" varchar(50) DEFAULT 'paid' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid,
	"property_id" uuid NOT NULL,
	"floor_number" integer NOT NULL,
	"floor_name" varchar(100) NOT NULL,
	"total_area" numeric(12, 2),
	"common_area" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" varchar(255) NOT NULL,
	"hsn_sac_code" varchar(20) DEFAULT '997212',
	"quantity" numeric(10, 2) DEFAULT '1.00',
	"rate" numeric(14, 2) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"gst_rate" numeric(5, 2) DEFAULT '18.00',
	"gst_amount" numeric(14, 2) NOT NULL,
	"total_amount" numeric(14, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"lease_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"tenant_id" uuid,
	"invoice_number" varchar(100) NOT NULL,
	"fy_year" varchar(10),
	"invoice_date" date NOT NULL,
	"due_date" date NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"base_rent" numeric(14, 2) NOT NULL,
	"cam_charges" numeric(14, 2) DEFAULT '0.00',
	"utility_charges" numeric(14, 2) DEFAULT '0.00',
	"other_charges" numeric(14, 2) DEFAULT '0.00',
	"subtotal" numeric(14, 2) NOT NULL,
	"gst_rate" numeric(5, 2) DEFAULT '18.00',
	"gst_amount" numeric(14, 2) NOT NULL,
	"gross_total" numeric(14, 2) NOT NULL,
	"tds_deducted" numeric(14, 2) DEFAULT '0.00',
	"net_payable" numeric(14, 2) NOT NULL,
	"amount_paid" numeric(14, 2) DEFAULT '0.00',
	"balance_due" numeric(14, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'issued' NOT NULL,
	"pdf_url" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "lease_notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lease_id" uuid NOT NULL,
	"notice_date" date NOT NULL,
	"effective_date" date NOT NULL,
	"notice_reason" "notice_reason" DEFAULT 'lease_expiry' NOT NULL,
	"initiated_by" varchar(20) DEFAULT 'tenant' NOT NULL,
	"remarks" text,
	"penalty_amount" numeric(14, 2) DEFAULT '0.00',
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "officex_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"overall_score" numeric(5, 2) NOT NULL,
	"workplace_health_score" numeric(5, 2) NOT NULL,
	"sla_compliance_score" numeric(5, 2) NOT NULL,
	"energy_efficiency_score" numeric(5, 2) NOT NULL,
	"recorded_month" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"pan" varchar(10),
	"gstin" varchar(15),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(10),
	"fy_start_month" integer DEFAULT 4 NOT NULL,
	"invoice_prefix" varchar(20) DEFAULT 'INV' NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ppm_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"scheduled_week" integer NOT NULL,
	"scheduled_date" date,
	"assigned_technician_id" uuid,
	"checklists" jsonb,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rent_roll_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lease_id" uuid,
	"entity_name" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rent_roll_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "rent_roll_configurations_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "rent_roll_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"snapshot_month" date NOT NULL,
	"total_properties" integer NOT NULL,
	"total_area" numeric(14, 2) NOT NULL,
	"occupied_area" numeric(14, 2) NOT NULL,
	"vacant_area" numeric(14, 2) NOT NULL,
	"occupancy_pct" numeric(5, 2) NOT NULL,
	"total_monthly_revenue" numeric(16, 2) NOT NULL,
	"total_cam" numeric(14, 2) NOT NULL,
	"total_collections" numeric(16, 2) NOT NULL,
	"total_outstanding" numeric(16, 2) NOT NULL,
	"noi_monthly" numeric(16, 2) NOT NULL,
	"average_rate_psf" numeric(10, 2) NOT NULL,
	"walt_months" numeric(6, 2) NOT NULL,
	"data_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"building_id" uuid,
	"floor_id" uuid,
	"space_number" varchar(50) NOT NULL,
	"space_type" varchar(50) DEFAULT 'office' NOT NULL,
	"floor_number" integer DEFAULT 1 NOT NULL,
	"carpet_area" numeric(10, 2),
	"chargeable_area" numeric(10, 2) NOT NULL,
	"standard_rate_psf" numeric(10, 2),
	"standard_cam_psf" numeric(10, 2),
	"status" "unit_status" DEFAULT 'available' NOT NULL,
	"current_lease_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lease_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"onboarding_tasks" jsonb NOT NULL,
	"fitout_start_date" date,
	"move_in_date" date,
	"status" varchar(50) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"tenant_code" varchar(50) NOT NULL,
	"trade_name" varchar(255) NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"industry" varchar(100),
	"pan" varchar(10),
	"gstin" varchar(15),
	"tan" varchar(10),
	"cin" varchar(21),
	"contact_person" varchar(150) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50) NOT NULL,
	"billing_address" text NOT NULL,
	"billing_city" varchar(100) NOT NULL,
	"billing_state" varchar(100) NOT NULL,
	"billing_pincode" varchar(10) NOT NULL,
	"status" "tenant_status" DEFAULT 'active' NOT NULL,
	"credit_limit" numeric(14, 2),
	"payment_terms_days" integer DEFAULT 30,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tenants_tenant_code_unique" UNIQUE("tenant_code")
);
--> statement-breakpoint
ALTER TABLE "leases" DROP CONSTRAINT "leases_tenant_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "leases" DROP CONSTRAINT "leases_unit_id_lease_units_id_fk";
--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "monthly_rent" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "security_deposit" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "escalation_pct" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "escalation_pct" SET DEFAULT '5.00';--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "org_id" uuid;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "property_id" uuid;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "building_id" uuid;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "floor_id" uuid;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "space_id" uuid;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "tenant_company_id" uuid;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "lease_code" varchar(50);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "trade_name" varchar(255);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "handover_date" date;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "fitout_period_days" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "rent_free_period_days" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "rent_commencement_date" date;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "unit_number" varchar(50);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "floor_number" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "carpet_area" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "chargeable_area" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "base_rent_psf" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "cam_rate_psf" numeric(10, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "cam_monthly" numeric(14, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "utility_fixed_monthly" numeric(14, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "parking_charges_monthly" numeric(14, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "signage_charges_monthly" numeric(14, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "other_charges_monthly" numeric(14, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "total_monthly_gross" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "annual_rent_gross" numeric(16, 2);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "security_deposit_months" integer DEFAULT 6;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "security_deposit_paid" numeric(14, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "security_deposit_bank" varchar(100);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "security_deposit_bg_ref" varchar(100);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "escalation_frequency_months" integer DEFAULT 12;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "next_escalation_date" date;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "lock_in_end_date" date;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "notice_period_days" integer DEFAULT 90 NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "renewal_status" varchar(50) DEFAULT 'not_due' NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "billing_frequency" varchar(50) DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "billing_due_day" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "gst_rate" numeric(5, 2) DEFAULT '18.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "tds_rate" numeric(5, 2) DEFAULT '10.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "broker_name" varchar(150);--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "brokerage_paid" numeric(14, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "termination_date" date;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "termination_reason" text;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "signed_agreement_url" text;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "org_id" uuid;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "micro_market" varchar(150);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "chargeable_area" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "occupancy_target_pct" numeric(5, 2) DEFAULT '90.00';--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "owner_user_id" uuid;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "alert_notifications" ADD CONSTRAINT "alert_notifications_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_assigned_vendor_id_users_id_fk" FOREIGN KEY ("assigned_vendor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_lease_id_leases_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_lease_id_leases_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_applied_by_users_id_fk" FOREIGN KEY ("applied_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_lease_id_leases_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lease_notices" ADD CONSTRAINT "lease_notices_lease_id_leases_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "officex_scores" ADD CONSTRAINT "officex_scores_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppm_tasks" ADD CONSTRAINT "ppm_tasks_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppm_tasks" ADD CONSTRAINT "ppm_tasks_assigned_technician_id_users_id_fk" FOREIGN KEY ("assigned_technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_roll_audit_logs" ADD CONSTRAINT "rent_roll_audit_logs_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_roll_configurations" ADD CONSTRAINT "rent_roll_configurations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_roll_snapshots" ADD CONSTRAINT "rent_roll_snapshots_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_onboarding" ADD CONSTRAINT "tenant_onboarding_lease_id_leases_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_onboarding" ADD CONSTRAINT "tenant_onboarding_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_company_id_tenants_id_fk" FOREIGN KEY ("tenant_company_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_unit_id_lease_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."lease_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
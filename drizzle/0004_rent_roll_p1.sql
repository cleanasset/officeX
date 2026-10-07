CREATE TYPE "public"."billing_mode" AS ENUM('advance', 'arrears');--> statement-breakpoint
CREATE TYPE "public"."charge_calc_basis" AS ENUM('per_area', 'per_seat', 'fixed', 'per_slot', 'metered', 'pro_rata_share', 'pct_of_turnover', 'per_use');--> statement-breakpoint
CREATE TYPE "public"."clause_status" AS ENUM('open', 'exercised', 'lapsed', 'waived');--> statement-breakpoint
CREATE TYPE "public"."clause_type" AS ENUM('lock_in', 'notice', 'renewal_option', 'break_option', 'rofr', 'rofo', 'expansion', 'exclusivity', 'subletting', 'reinstatement');--> statement-breakpoint
CREATE TYPE "public"."concession_type" AS ENUM('rent_free', 'fitout_contribution', 'discount_pct', 'discount_amount', 'capex_by_landlord');--> statement-breakpoint
CREATE TYPE "public"."doc_status" AS ENUM('draft', 'under_review', 'approved', 'signed', 'executed', 'expired', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."doc_type" AS ENUM('term_sheet', 'loi', 'lease_agreement', 'leave_and_licence', 'amendment', 'renewal_agreement', 'termination', 'possession_letter', 'deposit_receipt', 'noc', 'insurance', 'fitout', 'other');--> statement-breakpoint
CREATE TYPE "public"."doc_visibility" AS ENUM('internal', 'client_visible', 'occupant_visible');--> statement-breakpoint
CREATE TYPE "public"."escalation_type" AS ENUM('initial', 'percentage', 'fixed_amount', 'index_based', 'market_review', 'stepped_schedule');--> statement-breakpoint
CREATE TYPE "public"."rent_step_status" AS ENUM('scheduled', 'due', 'applied', 'pending_resolution', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('contract_approval', 'escalation_due', 'expiry_renewal', 'document_missing', 'dispute_followup');--> statement-breakpoint
CREATE TABLE "concession" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"concession_type" "concession_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"concession_value" numeric(14, 2) NOT NULL,
	"description" text,
	"clawback_clause" text,
	"amortise" boolean DEFAULT false NOT NULL,
	"approved_by" uuid,
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
CREATE TABLE "contract_charge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"component" text NOT NULL,
	"calc_basis" charge_calc_basis NOT NULL,
	"rate" numeric(14, 4),
	"rate_period" text DEFAULT 'month',
	"quantity_basis" numeric(14, 2),
	"is_included" boolean DEFAULT false NOT NULL,
	"is_recoverable" boolean DEFAULT false NOT NULL,
	"invoice_group" text DEFAULT 'rent' NOT NULL,
	"billing_entity_id" uuid,
	"tax_profile_id" uuid,
	"hsn_sac" text,
	"source_document_id" uuid,
	"billing_mode" "billing_mode" DEFAULT 'advance' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"cam_pool_id" uuid,
	"meter_id" uuid,
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
CREATE TABLE "contract_clause" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"clause_type" "clause_type" NOT NULL,
	"clause_title" text NOT NULL,
	"clause_text" text NOT NULL,
	"window_start" date,
	"window_end" date,
	"terms" jsonb,
	"status" "clause_status" DEFAULT 'open' NOT NULL,
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
CREATE TABLE "contract_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"doc_type" "doc_type" NOT NULL,
	"file_name" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"status" "doc_status" DEFAULT 'executed' NOT NULL,
	"effective_date" date,
	"expiry_date" date,
	"visibility" "doc_visibility" DEFAULT 'client_visible' NOT NULL,
	"storage_path" text NOT NULL,
	"checksum" text,
	"file_size_bytes" integer,
	"mime_type" text,
	"watermark_text" text,
	"download_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp with time zone,
	"source_import_batch_id" uuid,
	"source_row_id" text
);
--> statement-breakpoint
CREATE TABLE "rent_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"contract_charge_id" uuid NOT NULL,
	"step_no" integer NOT NULL,
	"effective_date" date NOT NULL,
	"escalation_type" "escalation_type" NOT NULL,
	"escalation_value" numeric(14, 2),
	"cycle_months" integer DEFAULT 12,
	"compounding" boolean DEFAULT true,
	"cpi_index" text,
	"cap_pct" numeric(5, 2),
	"floor_pct" numeric(5, 2),
	"rate" numeric(14, 4) NOT NULL,
	"status" "rent_step_status" DEFAULT 'scheduled' NOT NULL,
	"applied_at" timestamp with time zone,
	"applied_by" uuid,
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
CREATE TABLE "task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid,
	"contract_id" uuid,
	"task_type" "task_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"assigned_to" uuid,
	"assigned_role" text DEFAULT 'approver',
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" date,
	"resolution_comment" text,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
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
ALTER TABLE "concession" ADD CONSTRAINT "concession_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concession" ADD CONSTRAINT "concession_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concession" ADD CONSTRAINT "concession_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_charge" ADD CONSTRAINT "contract_charge_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_charge" ADD CONSTRAINT "contract_charge_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_charge" ADD CONSTRAINT "contract_charge_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_charge" ADD CONSTRAINT "contract_charge_billing_entity_id_billing_entity_id_fk" FOREIGN KEY ("billing_entity_id") REFERENCES "public"."billing_entity"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_charge" ADD CONSTRAINT "contract_charge_tax_profile_id_tax_profile_id_fk" FOREIGN KEY ("tax_profile_id") REFERENCES "public"."tax_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_clause" ADD CONSTRAINT "contract_clause_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_clause" ADD CONSTRAINT "contract_clause_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_clause" ADD CONSTRAINT "contract_clause_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_document" ADD CONSTRAINT "contract_document_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_document" ADD CONSTRAINT "contract_document_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_document" ADD CONSTRAINT "contract_document_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_step" ADD CONSTRAINT "rent_step_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_step" ADD CONSTRAINT "rent_step_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_step" ADD CONSTRAINT "rent_step_contract_charge_id_contract_charge_id_fk" FOREIGN KEY ("contract_charge_id") REFERENCES "public"."contract_charge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_client_account_id_client_account_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "concession_org_id_idx" ON "concession" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "concession_client_account_id_idx" ON "concession" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "concession_contract_id_idx" ON "concession" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "concession_dates_idx" ON "concession" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "contract_charge_org_id_idx" ON "contract_charge" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contract_charge_client_account_id_idx" ON "contract_charge" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "contract_charge_contract_id_idx" ON "contract_charge" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "contract_charge_component_idx" ON "contract_charge" USING btree ("component");--> statement-breakpoint
CREATE INDEX "contract_charge_invoice_group_idx" ON "contract_charge" USING btree ("invoice_group");--> statement-breakpoint
CREATE INDEX "contract_clause_org_id_idx" ON "contract_clause" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contract_clause_client_account_id_idx" ON "contract_clause" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "contract_clause_contract_id_idx" ON "contract_clause" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "contract_clause_clause_type_idx" ON "contract_clause" USING btree ("clause_type");--> statement-breakpoint
CREATE INDEX "contract_clause_status_idx" ON "contract_clause" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contract_document_org_id_idx" ON "contract_document" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contract_document_client_account_id_idx" ON "contract_document" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "contract_document_contract_id_idx" ON "contract_document" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "contract_document_doc_type_idx" ON "contract_document" USING btree ("doc_type");--> statement-breakpoint
CREATE INDEX "contract_document_is_current_idx" ON "contract_document" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "contract_document_status_idx" ON "contract_document" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rent_step_org_id_idx" ON "rent_step" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "rent_step_client_account_id_idx" ON "rent_step" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "rent_step_contract_charge_id_idx" ON "rent_step" USING btree ("contract_charge_id");--> statement-breakpoint
CREATE INDEX "rent_step_effective_date_idx" ON "rent_step" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "rent_step_status_idx" ON "rent_step" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_org_id_idx" ON "task" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "task_client_account_id_idx" ON "task" USING btree ("client_account_id");--> statement-breakpoint
CREATE INDEX "task_contract_id_idx" ON "task" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "task_task_type_idx" ON "task" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "task" USING btree ("status");
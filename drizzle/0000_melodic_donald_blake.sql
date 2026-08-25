CREATE TYPE "public"."property_grade" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('submitted', 'shortlisted', 'awarded', 'declined');--> statement-breakpoint
CREATE TYPE "public"."rfq_status" AS ENUM('open', 'evaluating', 'awarded', 'closed');--> statement-breakpoint
CREATE TYPE "public"."unit_status" AS ENUM('available', 'leased', 'in_negotiation');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'property_manager', 'facility_manager', 'tenant_admin', 'vendor_admin', 'broker', 'auditor');--> statement-breakpoint
CREATE TYPE "public"."wo_status" AS ENUM('issued', 'accepted', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"trace_id" varchar(100) NOT NULL,
	"module" varchar(100) NOT NULL,
	"action" text NOT NULL,
	"ip_address" varchar(45),
	"severity" varchar(50) NOT NULL,
	"is_ai_prediction" boolean DEFAULT false,
	"human_override_action" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid,
	"name" varchar(255) NOT NULL,
	"issuing_authority" varchar(255) NOT NULL,
	"expiry_date" date NOT NULL,
	"certificate_url" varchar(255),
	"status" varchar(50) DEFAULT 'valid',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "helpdesk_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"property_id" uuid,
	"category" varchar(100) NOT NULL,
	"priority" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"sla_response_deadline" timestamp with time zone NOT NULL,
	"sla_resolution_deadline" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'open',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lease_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_number" varchar(50) NOT NULL,
	"floor_number" integer NOT NULL,
	"area_sqft" numeric(10, 2) NOT NULL,
	"base_rent" numeric(12, 2) NOT NULL,
	"status" "unit_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"unit_id" uuid,
	"start_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"monthly_rent" numeric(12, 2) NOT NULL,
	"security_deposit" numeric(12, 2) NOT NULL,
	"escalation_pct" numeric(4, 2) DEFAULT '5.00' NOT NULL,
	"lock_in_months" integer DEFAULT 36 NOT NULL,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"grade" "property_grade" DEFAULT 'A' NOT NULL,
	"total_area" numeric(12, 2) NOT NULL,
	"owner_name" varchar(100),
	"owner_company" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid,
	"vendor_id" uuid,
	"base_quote" numeric(12, 2) NOT NULL,
	"gst_amt" numeric(12, 2) NOT NULL,
	"gross_quote" numeric(12, 2) NOT NULL,
	"response_sla_mins" integer NOT NULL,
	"resolution_sla_mins" integer NOT NULL,
	"status" "quote_status" DEFAULT 'submitted',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid,
	"title" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"scope_of_work" text NOT NULL,
	"manpower_required" integer,
	"quote_deadline" timestamp with time zone NOT NULL,
	"status" "rfq_status" DEFAULT 'open',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_properties" (
	"user_id" uuid NOT NULL,
	"property_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'tenant_admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "utility_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid,
	"month_year" date NOT NULL,
	"electricity_kwh" numeric(12, 2) NOT NULL,
	"water_kl" numeric(12, 2) NOT NULL,
	"dg_runtime_hours" numeric(10, 2) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid,
	"vendor_id" uuid,
	"gross_value" numeric(12, 2) NOT NULL,
	"milestones" jsonb NOT NULL,
	"status" "wo_status" DEFAULT 'issued',
	"escrow_transaction_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_certificates" ADD CONSTRAINT "compliance_certificates_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk_tickets" ADD CONSTRAINT "helpdesk_tickets_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk_tickets" ADD CONSTRAINT "helpdesk_tickets_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lease_units" ADD CONSTRAINT "lease_units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_unit_id_lease_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."lease_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_vendor_id_users_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_properties" ADD CONSTRAINT "user_properties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_properties" ADD CONSTRAINT "user_properties_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utility_metrics" ADD CONSTRAINT "utility_metrics_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vendor_id_users_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
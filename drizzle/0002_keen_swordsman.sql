CREATE TABLE "access_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pass_id" uuid,
	"visitor_id" uuid,
	"access_point" varchar(100) NOT NULL,
	"direction" varchar(20) DEFAULT 'IN' NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"source_system" varchar(100) DEFAULT 'GUNNEBO_OPTICAL' NOT NULL,
	"result" varchar(50) DEFAULT 'GRANTED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"pass_type" varchar(50) DEFAULT 'DIGITAL_QR' NOT NULL,
	"qr_token" varchar(255) NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_to" timestamp with time zone NOT NULL,
	"access_zones" text DEFAULT 'LOBBY' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"returned_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	CONSTRAINT "access_passes_qr_token_unique" UNIQUE("qr_token")
);
--> statement-breakpoint
CREATE TABLE "adjustment_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"note_type" varchar(20) NOT NULL,
	"note_number" varchar(100) NOT NULL,
	"reason" varchar(100) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"gst_amount" numeric(14, 2) NOT NULL,
	"total_adjustment" numeric(14, 2) NOT NULL,
	"issued_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'applied' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "adjustment_notes_note_number_unique" UNIQUE("note_number")
);
--> statement-breakpoint
CREATE TABLE "audit_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" varchar(100) NOT NULL,
	"severity" varchar(50) DEFAULT 'medium' NOT NULL,
	"finding" text NOT NULL,
	"owner_id" uuid,
	"due_date" date NOT NULL,
	"capa_id" uuid,
	"closure_status" varchar(50) DEFAULT 'open' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid,
	"legal_name" varchar(255) NOT NULL,
	"trade_name" varchar(255),
	"pan" varchar(10) NOT NULL,
	"gstin" varchar(15) NOT NULL,
	"state_code" varchar(5) NOT NULL,
	"registered_address" text NOT NULL,
	"bank_name" varchar(150),
	"bank_account_number" varchar(50),
	"bank_ifsc" varchar(20),
	"bank_branch" varchar(100),
	"invoice_prefix" varchar(20) DEFAULT 'INV-2026' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"billing_entity_id" uuid,
	"period_month" varchar(7) NOT NULL,
	"total_contracts" integer NOT NULL,
	"total_invoices_generated" integer NOT NULL,
	"gross_billed_amount" numeric(16, 2) NOT NULL,
	"total_gst_amount" numeric(14, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"run_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "broker_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"broker_type" varchar(50) NOT NULL,
	"services" jsonb NOT NULL,
	"operating_cities" jsonb NOT NULL,
	"operating_micro_markets" jsonb,
	"rera_applicable" boolean DEFAULT false NOT NULL,
	"rera_registration_no" varchar(50),
	"years_in_business" integer DEFAULT 0,
	"team_size_band" varchar(50),
	"client_types" jsonb,
	"typical_deal_size_band" varchar(50),
	"transactions_per_year_band" varchar(50),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "capa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_id" varchar(100),
	"action_type" varchar(50) DEFAULT 'CORRECTIVE' NOT NULL,
	"action" text NOT NULL,
	"owner_id" uuid,
	"due_date" date NOT NULL,
	"priority" varchar(20) DEFAULT 'high' NOT NULL,
	"evidence_uri" text,
	"verification_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "client_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"account_code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_person" varchar(150) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50) NOT NULL,
	"portal_access_enabled" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "client_accounts_account_code_unique" UNIQUE("account_code")
);
--> statement-breakpoint
CREATE TABLE "compliance_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"obligation_id" uuid NOT NULL,
	"document_id" uuid,
	"document_title" varchar(255) NOT NULL,
	"file_uri" text,
	"issue_date" date,
	"expiry_date" date,
	"verification_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"verified_by" uuid,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "compliance_obligations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"category" varchar(100) NOT NULL,
	"subcategory" varchar(100),
	"authority" varchar(150) NOT NULL,
	"requirement" text NOT NULL,
	"frequency" varchar(50) DEFAULT 'ANNUAL' NOT NULL,
	"owner_id" uuid,
	"criticality" varchar(20) DEFAULT 'HIGH' NOT NULL,
	"evidence_required" boolean DEFAULT true NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"obligation_id" uuid NOT NULL,
	"due_date" date NOT NULL,
	"reminder_days" integer DEFAULT 30 NOT NULL,
	"recurrence_rule" varchar(100),
	"status" varchar(50) DEFAULT 'upcoming' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"charge_type" varchar(50) NOT NULL,
	"billing_model" varchar(50) DEFAULT 'area' NOT NULL,
	"rate" numeric(12, 2) NOT NULL,
	"unit" varchar(20) DEFAULT 'psf_month' NOT NULL,
	"monthly_amount" numeric(14, 2) NOT NULL,
	"gst_rate" numeric(5, 2) DEFAULT '18.00' NOT NULL,
	"hsn_sac_code" varchar(20) DEFAULT '997212' NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"file_url" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size_bytes" integer,
	"status" varchar(50) DEFAULT 'executed' NOT NULL,
	"is_executed" boolean DEFAULT true NOT NULL,
	"execution_date" date,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"prospect_name" varchar(255) NOT NULL,
	"industry" varchar(100),
	"contact_person" varchar(150),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"proposed_space_id" uuid,
	"proposed_area_sqft" numeric(12, 2),
	"proposed_seats" integer,
	"target_rent_psf" numeric(10, 2),
	"target_commencement_date" date,
	"stage" varchar(50) DEFAULT 'qualified' NOT NULL,
	"probability_pct" integer DEFAULT 50 NOT NULL,
	"broker_id" uuid,
	"converted_contract_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"document_number" varchar(100),
	"issue_date" date,
	"expiry_date" date,
	"file_uri" text NOT NULL,
	"mime_type" varchar(50) DEFAULT 'application/pdf' NOT NULL,
	"file_size_bytes" integer DEFAULT 0 NOT NULL,
	"verification_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"reviewer_id" uuid,
	"review_comment" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"product_code" varchar(50) DEFAULT 'RR' NOT NULL,
	"edition" varchar(50) DEFAULT 'professional' NOT NULL,
	"addons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"valid_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"billing_model" varchar(50) DEFAULT 'area' NOT NULL,
	"total_rows" integer NOT NULL,
	"valid_rows" integer NOT NULL,
	"warning_rows" integer DEFAULT 0 NOT NULL,
	"error_rows" integer DEFAULT 0 NOT NULL,
	"control_total_area" numeric(14, 2) DEFAULT '0.00',
	"control_total_rent" numeric(16, 2) DEFAULT '0.00',
	"status" varchar(50) DEFAULT 'staged' NOT NULL,
	"preparer_id" uuid,
	"committed_at" timestamp with time zone,
	"rolled_back_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"row_number" integer NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"normalized_payload" jsonb,
	"validation_status" varchar(50) DEFAULT 'passed' NOT NULL,
	"rule_codes" jsonb DEFAULT '[]'::jsonb,
	"error_details" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"location" varchar(255) NOT NULL,
	"incident_type" varchar(100) NOT NULL,
	"severity" varchar(50) DEFAULT 'medium' NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"reported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"persons_involved" text,
	"description" text NOT NULL,
	"immediate_action" text NOT NULL,
	"status" varchar(50) DEFAULT 'open' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inspection_id" uuid NOT NULL,
	"category" varchar(100) NOT NULL,
	"severity" varchar(50) DEFAULT 'medium' NOT NULL,
	"observation" text NOT NULL,
	"evidence_uri" text,
	"capa_id" uuid
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"asset_id" uuid,
	"vendor_id" uuid,
	"type" varchar(100) NOT NULL,
	"scheduled_date" date NOT NULL,
	"inspector_id" uuid,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"score" numeric(5, 2),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kyc_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"stage" varchar(50) DEFAULT 'K0_CONTACT' NOT NULL,
	"status" varchar(50) DEFAULT 'submitted' NOT NULL,
	"submission_notes" text,
	"reviewer_id" uuid,
	"reviewed_at" timestamp with time zone,
	"reviewer_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "management_mandates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"mandate_name" varchar(255) NOT NULL,
	"fee_model" varchar(50) DEFAULT 'pct_collections' NOT NULL,
	"fee_rate" numeric(10, 2) NOT NULL,
	"settlement_type" varchar(50) DEFAULT 'direct_to_owner' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mapping_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"template_name" varchar(150) NOT NULL,
	"source_system" varchar(100),
	"column_mappings" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organization_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'org_admin' NOT NULL,
	"designation" varchar(100),
	"is_authorized_signatory" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "owner_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"ownership_type" varchar(50) NOT NULL,
	"asset_types" jsonb NOT NULL,
	"portfolio_property_count" integer DEFAULT 0,
	"portfolio_area_sqft" numeric(14, 2) DEFAULT '0.00',
	"operating_cities" jsonb NOT NULL,
	"approx_leasable_area_sqft" numeric(14, 2) DEFAULT '0.00',
	"approx_occupancy_pct" numeric(5, 2) DEFAULT '0.00',
	"services_required" jsonb,
	"ownership_proof_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "owner_statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"client_account_id" uuid NOT NULL,
	"statement_number" varchar(100) NOT NULL,
	"period_month" varchar(7) NOT NULL,
	"gross_billed" numeric(16, 2) NOT NULL,
	"total_collected" numeric(16, 2) NOT NULL,
	"total_arrears" numeric(16, 2) NOT NULL,
	"operator_mgmt_fee" numeric(14, 2) NOT NULL,
	"reimbursable_expenses" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"net_remittance_amount" numeric(16, 2) NOT NULL,
	"remittance_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"remittance_date" date,
	"remittance_utr" varchar(100),
	"issued_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "owner_statements_statement_number_unique" UNIQUE("statement_number")
);
--> statement-breakpoint
CREATE TABLE "payment_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"allocated_base_rent" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"allocated_cam" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"allocated_gst" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"allocated_other" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"total_allocated" numeric(14, 2) NOT NULL,
	"allocated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"vendor_id" uuid,
	"contractor" varchar(150) NOT NULL,
	"permit_type" varchar(100) NOT NULL,
	"risk_controls" text NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_to" timestamp with time zone NOT NULL,
	"approver_id" uuid,
	"status" varchar(50) DEFAULT 'pending_approval' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"plan_name" varchar(150) NOT NULL,
	"seat_type" varchar(50) NOT NULL,
	"rate_per_month" numeric(12, 2) NOT NULL,
	"inclusions" jsonb,
	"security_deposit_months" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rent_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"effective_date" date NOT NULL,
	"base_rate_psf" numeric(10, 2) NOT NULL,
	"monthly_base_rent" numeric(14, 2) NOT NULL,
	"escalation_pct" numeric(5, 2) NOT NULL,
	"step_type" varchar(50) DEFAULT 'fixed_pct' NOT NULL,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "risks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"category" varchar(100) NOT NULL,
	"statement" text NOT NULL,
	"likelihood" integer DEFAULT 3 NOT NULL,
	"impact" integer DEFAULT 3 NOT NULL,
	"inherent_score" integer DEFAULT 9 NOT NULL,
	"mitigation" text NOT NULL,
	"residual_score" integer DEFAULT 4 NOT NULL,
	"owner_id" uuid,
	"status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seat_inventories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"seat_type" varchar(50) NOT NULL,
	"total_seats" integer NOT NULL,
	"occupied_seats" integer DEFAULT 0 NOT NULL,
	"reserved_seats" integer DEFAULT 0 NOT NULL,
	"available_seats" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"registration_no" varchar(50) NOT NULL,
	"type" varchar(50) DEFAULT 'FOUR_WHEELER' NOT NULL,
	"parking_slot" varchar(50),
	"in_at" timestamp with time zone,
	"out_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vendor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"vendor_category" jsonb NOT NULL,
	"service_subcategories" jsonb,
	"cities_served" jsonb NOT NULL,
	"building_segments" jsonb NOT NULL,
	"years_in_business" integer DEFAULT 0 NOT NULL,
	"employee_count" integer DEFAULT 0,
	"technical_staff_count" integer DEFAULT 0,
	"active_client_count" integer DEFAULT 0,
	"managed_area_sqft" numeric(14, 2) DEFAULT '0.00',
	"insurance_available" boolean DEFAULT false NOT NULL,
	"pf_registration" boolean DEFAULT false,
	"esic_registration" boolean DEFAULT false,
	"iso_certifications" jsonb,
	"licenses_certifications" jsonb,
	"rfp_response_enabled" boolean DEFAULT true NOT NULL,
	"bank_details_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visitor_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"approver_id" uuid NOT NULL,
	"decision" varchar(50) NOT NULL,
	"reason" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"visitor_type" varchar(50) DEFAULT 'guest' NOT NULL,
	"name" varchar(150) NOT NULL,
	"company" varchar(150),
	"mobile" varchar(30) NOT NULL,
	"email" varchar(150),
	"photo_ref" text,
	"identity_type" varchar(50),
	"identity_ref_token" varchar(100),
	"consent_flag" boolean DEFAULT true NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"building_id" uuid,
	"zone_id" varchar(100),
	"host_user_id" uuid,
	"tenant_id" uuid,
	"purpose" varchar(255) NOT NULL,
	"visit_start" timestamp with time zone NOT NULL,
	"visit_end" timestamp with time zone NOT NULL,
	"approval_status" varchar(50) DEFAULT 'approved' NOT NULL,
	"checkin_at" timestamp with time zone,
	"checkout_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'pre_registered' NOT NULL,
	"risk_level" varchar(20) DEFAULT 'low' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"identity_reference" varchar(150) NOT NULL,
	"reason" text NOT NULL,
	"active_from" timestamp with time zone DEFAULT now() NOT NULL,
	"active_to" timestamp with time zone,
	"approval_status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_pass_id_access_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."access_passes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_passes" ADD CONSTRAINT "access_passes_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_notes" ADD CONSTRAINT "adjustment_notes_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_notes" ADD CONSTRAINT "adjustment_notes_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_entities" ADD CONSTRAINT "billing_entities_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_entities" ADD CONSTRAINT "billing_entities_client_account_id_client_accounts_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_runs" ADD CONSTRAINT "billing_runs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_runs" ADD CONSTRAINT "billing_runs_billing_entity_id_billing_entities_id_fk" FOREIGN KEY ("billing_entity_id") REFERENCES "public"."billing_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_runs" ADD CONSTRAINT "billing_runs_run_by_users_id_fk" FOREIGN KEY ("run_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_profiles" ADD CONSTRAINT "broker_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capa" ADD CONSTRAINT "capa_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_accounts" ADD CONSTRAINT "client_accounts_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_evidence" ADD CONSTRAINT "compliance_evidence_obligation_id_compliance_obligations_id_fk" FOREIGN KEY ("obligation_id") REFERENCES "public"."compliance_obligations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_evidence" ADD CONSTRAINT "compliance_evidence_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_evidence" ADD CONSTRAINT "compliance_evidence_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_schedules" ADD CONSTRAINT "compliance_schedules_obligation_id_compliance_obligations_id_fk" FOREIGN KEY ("obligation_id") REFERENCES "public"."compliance_obligations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_charges" ADD CONSTRAINT "contract_charges_contract_id_leases_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_documents" ADD CONSTRAINT "contract_documents_contract_id_leases_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_documents" ADD CONSTRAINT "contract_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_proposed_space_id_spaces_id_fk" FOREIGN KEY ("proposed_space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_broker_id_users_id_fk" FOREIGN KEY ("broker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_preparer_id_users_id_fk" FOREIGN KEY ("preparer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_batch_id_import_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."import_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_cases" ADD CONSTRAINT "kyc_cases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_cases" ADD CONSTRAINT "kyc_cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_cases" ADD CONSTRAINT "kyc_cases_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_mandates" ADD CONSTRAINT "management_mandates_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_mandates" ADD CONSTRAINT "management_mandates_client_account_id_client_accounts_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapping_templates" ADD CONSTRAINT "mapping_templates_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_profiles" ADD CONSTRAINT "owner_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statements" ADD CONSTRAINT "owner_statements_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statements" ADD CONSTRAINT "owner_statements_client_account_id_client_accounts_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_collections_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permits" ADD CONSTRAINT "permits_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permits" ADD CONSTRAINT "permits_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_steps" ADD CONSTRAINT "rent_steps_contract_id_leases_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risks" ADD CONSTRAINT "risks_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risks" ADD CONSTRAINT "risks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_inventories" ADD CONSTRAINT "seat_inventories_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_approvals" ADD CONSTRAINT "visitor_approvals_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_approvals" ADD CONSTRAINT "visitor_approvals_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
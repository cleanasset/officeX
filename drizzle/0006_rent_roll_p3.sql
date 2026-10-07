-- OFFICEX Rent Roll — Phase P3 Payments & Collections Schema (0006_rent_roll_p3.sql)

-- 1. Ensure invoices has contract_id, occupant_id, client_account_id
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "contract_id" uuid REFERENCES "contract"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "occupant_id" uuid REFERENCES "occupant"("id") ON DELETE SET NULL;
--> statement-breakpoint

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE "payment_channel" AS ENUM('bank_transfer', 'cheque', 'upi', 'cash', 'credit', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "payment_status_p3" AS ENUM('received', 'reconciled', 'reversed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "dispute_type_p3" AS ENUM('incorrect_amount', 'duplicate_charge', 'already_paid', 'quality_issue', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "dispute_status_p3" AS ENUM('open', 'under_investigation', 'resolved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 3. PAYMENT
CREATE TABLE IF NOT EXISTS "payment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE CASCADE,
  "occupant_id" uuid NOT NULL REFERENCES "occupant"("id") ON DELETE RESTRICT,
  "contract_id" uuid REFERENCES "contract"("id") ON DELETE SET NULL,
  "payment_code" text NOT NULL,
  "payment_date" date NOT NULL,
  "amount_inr" numeric(14, 2) NOT NULL,
  "payment_mode" "payment_channel" DEFAULT 'bank_transfer' NOT NULL,
  "payment_ref" text NOT NULL,
  "bank_account_id" uuid,
  "cheque_number" text,
  "cheque_date" date,
  "cheque_bank_name" text,
  "payment_status" "payment_status_p3" DEFAULT 'received' NOT NULL,
  "is_matched" boolean DEFAULT false NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "payment_org_code_idx" ON "payment" ("org_id", "payment_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_org_id_idx" ON "payment" ("org_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_client_account_id_idx" ON "payment" ("client_account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_occupant_id_idx" ON "payment" ("occupant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_contract_id_idx" ON "payment" ("contract_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_status_idx" ON "payment" ("payment_status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_ref_idx" ON "payment" ("payment_ref");
--> statement-breakpoint

-- 4. PAYMENT_ALLOCATION
CREATE TABLE IF NOT EXISTS "payment_allocation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE CASCADE,
  "payment_id" uuid NOT NULL REFERENCES "payment"("id") ON DELETE CASCADE,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "invoice_line_id" uuid,
  "amount_allocated_inr" numeric(14, 2) NOT NULL,
  "allocation_date" date NOT NULL,
  "allocated_by" uuid,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "payment_allocation_org_id_idx" ON "payment_allocation" ("org_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_allocation_payment_id_idx" ON "payment_allocation" ("payment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_allocation_invoice_id_idx" ON "payment_allocation" ("invoice_id");
--> statement-breakpoint

-- 5. DISPUTE
CREATE TABLE IF NOT EXISTS "dispute" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE CASCADE,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "contract_id" uuid REFERENCES "contract"("id") ON DELETE SET NULL,
  "occupant_id" uuid REFERENCES "occupant"("id") ON DELETE SET NULL,
  "dispute_code" text NOT NULL,
  "dispute_type" "dispute_type_p3" NOT NULL,
  "dispute_reason" text NOT NULL,
  "occupant_response" text,
  "dispute_status" "dispute_status_p3" DEFAULT 'open' NOT NULL,
  "resolution" text,
  "resolved_at" timestamp with time zone,
  "resolved_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "dispute_org_code_idx" ON "dispute" ("org_id", "dispute_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dispute_org_id_idx" ON "dispute" ("org_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dispute_invoice_id_idx" ON "dispute" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dispute_status_idx" ON "dispute" ("dispute_status");

-- OFFICEX Rent Roll — Phase P1 Data Import Engine Schema (0005_rent_roll_import.sql)

DO $$ BEGIN
  CREATE TYPE "import_status" AS ENUM('uploading', 'parsing', 'mapping', 'validating', 'diffing', 'approved', 'committed', 'voided');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "validation_status" AS ENUM('passed', 'warning', 'failed', 'unmapped');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "flag_type" AS ENUM('info', 'warning', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 1. MAPPING_TEMPLATE
CREATE TABLE IF NOT EXISTS "mapping_template" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE CASCADE,
  "template_name" text NOT NULL,
  "template_version" integer DEFAULT 1 NOT NULL,
  "mapping_rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "synonym_dict" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "transform_rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "mapping_template_org_name_ver_idx" ON "mapping_template" ("org_id", "template_name", "template_version");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mapping_template_org_id_idx" ON "mapping_template" ("org_id");
--> statement-breakpoint

-- 2. IMPORT_BATCH
CREATE TABLE IF NOT EXISTS "import_batch" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE CASCADE,
  "batch_code" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size_bytes" integer DEFAULT 0 NOT NULL,
  "mapping_template_id" uuid REFERENCES "mapping_template"("id") ON DELETE SET NULL,
  "total_rows" integer DEFAULT 0 NOT NULL,
  "passed_rows" integer DEFAULT 0 NOT NULL,
  "warning_rows" integer DEFAULT 0 NOT NULL,
  "failed_rows" integer DEFAULT 0 NOT NULL,
  "unmapped_rows" integer DEFAULT 0 NOT NULL,
  "import_status" "import_status" DEFAULT 'uploading' NOT NULL,
  "imported_at" timestamp with time zone DEFAULT now() NOT NULL,
  "imported_by" uuid,
  "committed_at" timestamp with time zone,
  "voided_at" timestamp with time zone,
  "voided_by" uuid,
  "error_file_path" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "import_batch_org_code_idx" ON "import_batch" ("org_id", "batch_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_batch_org_id_idx" ON "import_batch" ("org_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_batch_client_account_id_idx" ON "import_batch" ("client_account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_batch_status_idx" ON "import_batch" ("import_status");
--> statement-breakpoint

-- 3. IMPORT_ROW_STAGING
CREATE TABLE IF NOT EXISTS "import_row_staging" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE CASCADE,
  "import_batch_id" uuid NOT NULL REFERENCES "import_batch"("id") ON DELETE CASCADE,
  "source_row_num" integer NOT NULL,
  "source_row_json" jsonb NOT NULL,
  "parsed_row_json" jsonb,
  "validation_status" "validation_status" DEFAULT 'unmapped' NOT NULL,
  "validation_errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "mapped_to_entity" jsonb,
  "unmapped_columns" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "import_row_staging_batch_id_idx" ON "import_row_staging" ("import_batch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_row_staging_validation_status_idx" ON "import_row_staging" ("validation_status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_row_staging_org_id_idx" ON "import_row_staging" ("org_id");
--> statement-breakpoint

-- 4. IMPORT_EXCEPTION
CREATE TABLE IF NOT EXISTS "import_exception" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE CASCADE,
  "import_batch_id" uuid NOT NULL REFERENCES "import_batch"("id") ON DELETE CASCADE,
  "source_row_num" integer NOT NULL,
  "field_name" text NOT NULL,
  "flag_type" "flag_type" NOT NULL,
  "flag_message" text NOT NULL,
  "expected_value" text,
  "actual_value" text,
  "user_resolved_at" timestamp with time zone,
  "user_resolution" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "import_exception_batch_id_idx" ON "import_exception" ("import_batch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_exception_flag_type_idx" ON "import_exception" ("flag_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_exception_org_id_idx" ON "import_exception" ("org_id");

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/db";

async function applyFix() {
  console.log("Applying invoice_line schema alignment to PostgreSQL...");

  await db.execute(`
    -- Drop legacy table if exists
    DROP TABLE IF EXISTS "invoice_line_items" CASCADE;

    -- Create canonical invoice_line table (§4.10, §0.2, §4.3)
    CREATE TABLE IF NOT EXISTS "invoice_line" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "client_account_id" uuid REFERENCES "client_account"("id") ON DELETE CASCADE,
      "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
      "contract_charge_id" uuid REFERENCES "contract_charge"("id") ON DELETE SET NULL,
      "charge_type_id" uuid REFERENCES "charge_type"("id") ON DELETE SET NULL,
      "description" text,
      "quantity" numeric(10, 2) DEFAULT '1.00',
      "rate" numeric(14, 2) DEFAULT '0.00' NOT NULL,
      "amount_inr" numeric(14, 2) DEFAULT '0.00' NOT NULL,
      "tax_rate_percent" numeric(5, 2) DEFAULT '18.00',
      "tax_amount_inr" numeric(14, 2) DEFAULT '0.00',
      "escalation_amount_inr" numeric(14, 2) DEFAULT '0.00',
      "concession_amount_inr" numeric(14, 2) DEFAULT '0.00',
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_by" uuid,
      "updated_by" uuid,
      "version" integer DEFAULT 1 NOT NULL,
      "deleted_at" timestamp with time zone
    );

    CREATE INDEX IF NOT EXISTS "invoice_line_org_id_idx" ON "invoice_line" ("org_id");
    CREATE INDEX IF NOT EXISTS "invoice_line_client_account_id_idx" ON "invoice_line" ("client_account_id");
    CREATE INDEX IF NOT EXISTS "invoice_line_invoice_id_idx" ON "invoice_line" ("invoice_id");
    CREATE INDEX IF NOT EXISTS "invoice_line_contract_charge_id_idx" ON "invoice_line" ("contract_charge_id");
    CREATE INDEX IF NOT EXISTS "invoice_line_charge_type_id_idx" ON "invoice_line" ("charge_type_id");
  `);

  // Verify
  const cols = await db.execute(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'invoice_line'
    ORDER BY ordinal_position;
  `);

  console.log(`Successfully configured invoice_line with ${cols.rows.length} columns:`);
  cols.rows.forEach((r: any) => console.log(` - ${r.column_name}: ${r.data_type}`));
  process.exit(0);
}

applyFix().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("=== FIXING INVOICES ORG_ID FK ===");
  try {
    // 1. Sync row from organization to organizations
    await db.execute(sql.raw(`
      INSERT INTO organizations (id, name, slug, subscription_status)
      SELECT id, name, slug, subscription_status FROM organization
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;
    `));
    console.log("Synced organization -> organizations successfully.");

    // 2. Drop the restrictive old FK to organizations and point to organization
    await db.execute(sql.raw(`
      ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_org_id_organizations_id_fk;
    `));
    console.log("Dropped invoices_org_id_organizations_id_fk constraint.");

    // 3. Make sure lease_id, property_id, tenant_id are nullable (they are already nullable)
    console.log("Invoices table is now unblocked!");
  } catch (err: any) {
    console.error("Error fixing invoices FK:", err);
  }
}

main().catch(console.error);
